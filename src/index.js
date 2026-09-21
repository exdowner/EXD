import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import express from 'express';
import { loadCommands } from './handlers/commandHandler.js';
import { setCargosMenu, getCargosMenu } from './utils/cargosMenu.js';
import { addPontos } from './utils/banco.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();

// ====== Estado em memória ======
const eventosParticipantes = new Map(); // messageId -> Set(userId)
const eventosPontos = new Map();        // messageId -> pontos

// ====== Handler de interações ======
client.on('interactionCreate', async (interaction) => {

  // ========== Slash commands ==========
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro no comando ${interaction.commandName}:`, error);
      const msg = { content: '❌ Deu erro ao executar esse comando.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
    return;
  }

  // ========== Select menu: /cargoedit ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'cargoedit_menu') {
    setCargosMenu(interaction.values);
    await interaction.update({
      content: `✅ **${interaction.values.length}** cargo(s) configurado(s) para o \`/menucargo\`!`,
      embeds: [],
      components: [],
    });
    return;
  }

  // ========== Select menu: /menucargo ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'menu_cargos') {
    const selecionados = interaction.values;
    const todosDisponiveis = getCargosMenu();

    let adicionados = 0, removidos = 0;

    for (const cargoId of todosDisponiveis) {
      const temCargo = interaction.member.roles.cache.has(cargoId);
      const selecionado = selecionados.includes(cargoId);

      try {
        if (selecionado && !temCargo) {
          await interaction.member.roles.add(cargoId);
          adicionados++;
        } else if (!selecionado && temCargo) {
          await interaction.member.roles.remove(cargoId);
          removidos++;
        }
      } catch (err) {
        console.error(`Erro ao gerenciar cargo ${cargoId}:`, err.message);
      }
    }

    await interaction.reply({
      content: `✅ Cargos atualizados!\n➕ Adicionados: **${adicionados}**\n➖ Removidos: **${removidos}**`,
      ephemeral: true,
    });
    return;
  }

  // ========== Botões de evento ==========
  if (interaction.isButton()) {
    const userId = interaction.user.id;
    const msgId = interaction.message.id;

    if (!eventosParticipantes.has(msgId)) {
      eventosParticipantes.set(msgId, new Set());
    }
    const participantes = eventosParticipantes.get(msgId);

    // === Participar ===
    if (interaction.customId.startsWith('evento_participar_')) {
      if (participantes.has(userId)) {
        return interaction.reply({ content: '⚠️ Você já tá participando!', ephemeral: true });
      }

      participantes.add(userId);

      // Dá os pontos configurados no evento
      const pontosEvento = eventosPontos.get(msgId) || 0;
      if (pontosEvento > 0) {
        addPontos(userId, pontosEvento);
        return interaction.reply({
          content: `✅ Você entrou no evento e ganhou **${pontosEvento}** pontos!\n👥 Total: **${participantes.size}** participante(s).`,
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: `✅ Você entrou no evento!\n👥 Total: **${participantes.size}** participante(s).`,
        ephemeral: true,
      });
    }

    // === Sair ===
    if (interaction.customId.startsWith('evento_sair_')) {
      if (!participantes.has(userId)) {
        return interaction.reply({ content: '⚠️ Você não tá participando.', ephemeral: true });
      }

      participantes.delete(userId);

      const pontosEvento = eventosPontos.get(msgId) || 0;
      if (pontosEvento > 0) {
        addPontos(userId, -pontosEvento);
        return interaction.reply({
          content: `❌ Você saiu do evento e perdeu **${pontosEvento}** pontos.\n👥 Total: **${participantes.size}** participante(s).`,
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: `❌ Você saiu do evento.\n👥 Total: **${participantes.size}** participante(s).`,
        ephemeral: true,
      });
    }
  }
});

// ========== Bot online ==========
client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`📡 Servindo ${client.guilds.cache.size} servidor(es)`);
});

// ========== Express (health check do Render) ==========
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot online! 🤖'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.listen(PORT, () => console.log(`🌐 Web server na porta ${PORT}`));

// ========== Login ==========
console.log('🔑 Tentando logar...');

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Login OK'))
  .catch((err) => {
    console.error('❌ Erro no login:', err.message);
    process.exit(1);
  });

// ========== Carrega e registra os comandos ==========
(async () => {
  try {
    await loadCommands(client);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = [...client.commands.values()].map(cmd => cmd.data.toJSON());

    console.log(`🔄 Registrando ${commands.length} comando(s) no Discord...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`✅ ${commands.length} comando(s) registrado(s)!`);
  } catch (err) {
    console.error('⚠️ Erro:', err.message);
  }
})();
