import 'dotenv/config';
import {
  Client, GatewayIntentBits, Collection, REST, Routes,
  ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ChannelType, PermissionFlagsBits,
} from 'discord.js';
import express from 'express';
import { loadCommands } from './handlers/commandHandler.js';
import { setCargosMenu, getCargosMenu } from './utils/cargosMenu.js';
import { addPontos } from './utils/banco.js';
import {
  getLogsChannel, getTipos, addTipo, removeTipo, setFotoTipo,
  ticketsAbertos, config,
} from './utils/tickets.js';

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
const eventosParticipantes = new Map();
const eventosPontos = new Map();
const esperandoFoto = new Map(); // userId -> tipoId

client.on('eventoCriado', (messageId, pontos) => {
  eventosPontos.set(messageId, pontos);
});

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

  // ========== Select: /cargoedit ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'cargoedit_menu') {
    setCargosMenu(interaction.values);
    await interaction.update({
      content: `✅ **${interaction.values.length}** cargo(s) configurado(s) para o \`/menucargo\`!`,
      embeds: [], components: [],
    });
    return;
  }

  // ========== Select: /menucargo ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'menu_cargos') {
    const selecionados = interaction.values;
    const todosDisponiveis = getCargosMenu();
    let adicionados = 0, removidos = 0;

    for (const cargoId of todosDisponiveis) {
      const temCargo = interaction.member.roles.cache.has(cargoId);
      const selecionado = selecionados.includes(cargoId);
      try {
        if (selecionado && !temCargo) { await interaction.member.roles.add(cargoId); adicionados++; }
        else if (!selecionado && temCargo) { await interaction.member.roles.remove(cargoId); removidos++; }
      } catch (err) { console.error(`Erro cargo ${cargoId}:`, err.message); }
    }

    await interaction.reply({
      content: `✅ Cargos atualizados!\n➕ Adicionados: **${adicionados}**\n➖ Removidos: **${removidos}**`,
      ephemeral: true,
    });
    return;
  }

  // ========== Select: /ticketedit remove ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticketedit_remove_menu') {
    const ids = interaction.values;
    let removidos = 0;
    for (const id of ids) if (removeTipo(id)) removidos++;
    await interaction.update({
      content: `✅ **${removidos}** tipo(s) removido(s).`,
      embeds: [], components: [],
    });
    return;
  }

  // ========== Select: /ticketedit foto ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticketedit_foto_menu') {
    const tipoId = interaction.values[0];
    esperandoFoto.set(interaction.user.id, tipoId);
    await interaction.update({
      content: `📸 Agora **manda a foto aqui no canal** (como anexo). Vou salvar no tipo selecionado.`,
      embeds: [], components: [],
    });
    return;
  }

  // ========== Select: abrir ticket (escolher tipo) ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_tipo_menu') {
    const tipoId = interaction.values[0];
    const tipo = getTipos().find(t => t.id === tipoId);
    if (!tipo) return interaction.reply({ content: '❌ Tipo não encontrado.', ephemeral: true });

    // Cria canal privado
    const guild = interaction.guild;
    const nomeCanal = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

    try {
      const canal = await guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
          },
          {
            id: client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory],
          },
        ],
      });

      ticketsAbertos.set(canal.id, {
        autorId: interaction.user.id,
        tipoId: tipo.id,
        reivindicadoPor: null,
      });

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${tipo.emoji} Ticket: ${tipo.nome}`)
        .setDescription(
          `Olá <@${interaction.user.id}>! Um membro da equipe vai te atender em breve.\n\n` +
          `**Tipo:** ${tipo.emoji} ${tipo.nome}\n` +
          `**Status:** 🟡 Aguardando atendimento`
        )
        .setTimestamp();

      if (tipo.foto) embed.setImage(tipo.foto);

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_reivindicar').setLabel('Reivindicar').setEmoji('✋').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_fechar').setLabel('Fechar').setEmoji('🔒').setStyle(ButtonStyle.Danger),
      );

      await canal.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [botoes],
      });

      // Log
      const logsId = getLogsChannel();
      if (logsId) {
        const logsCanal = guild.channels.cache.get(logsId);
        if (logsCanal) {
          await logsCanal.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('📩 Novo Ticket Aberto')
                .addFields(
                  { name: 'Autor', value: `<@${interaction.user.id}>`, inline: true },
                  { name: 'Tipo', value: `${tipo.emoji} ${tipo.nome}`, inline: true },
                  { name: 'Canal', value: `<#${canal.id}>`, inline: true },
                )
                .setTimestamp(),
            ],
          });
        }
      }

      await interaction.reply({ content: `✅ Ticket criado: <#${canal.id}>`, ephemeral: true });
    } catch (err) {
      console.error('Erro ao criar ticket:', err);
      await interaction.reply({ content: `❌ Erro ao criar canal: ${err.message}`, ephemeral: true });
    }
    return;
  }

  // ========== Botões ==========
  if (interaction.isButton()) {
    const userId = interaction.user.id;
    const msgId = interaction.message.id;

    // --- Evento: participar ---
    if (interaction.customId.startsWith('evento_participar')) {
      if (!eventosParticipantes.has(msgId)) eventosParticipantes.set(msgId, new Set());
      const participantes = eventosParticipantes.get(msgId);
      if (participantes.has(userId)) return interaction.reply({ content: '⚠️ Você já tá participando!', ephemeral: true });
      participantes.add(userId);
      const pontosEvento = eventosPontos.get(msgId) || 0;
      if (pontosEvento > 0) addPontos(userId, pontosEvento);
      return interaction.reply({
        content: pontosEvento > 0
          ? `✅ Você entrou e ganhou **${pontosEvento}** pontos!\n👥 Total: **${participantes.size}**`
          : `✅ Você entrou!\n👥 Total: **${participantes.size}**`,
        ephemeral: true,
      });
    }

    // --- Evento: sair ---
    if (interaction.customId.startsWith('evento_sair')) {
      if (!eventosParticipantes.has(msgId)) eventosParticipantes.set(msgId, new Set());
      const participantes = eventosParticipantes.get(msgId);
      if (!participantes.has(userId)) return interaction.reply({ content: '⚠️ Você não tá participando.', ephemeral: true });
      participantes.delete(userId);
      const pontosEvento = eventosPontos.get(msgId) || 0;
      if (pontosEvento > 0) addPontos(userId, -pontosEvento);
      return interaction.reply({
        content: pontosEvento > 0
          ? `❌ Você saiu e perdeu **${pontosEvento}** pontos.\n👥 Total: **${participantes.size}**`
          : `❌ Você saiu.\n👥 Total: **${participantes.size}**`,
        ephemeral: true,
      });
    }

    // --- Ticket: abrir ---
    if (interaction.customId === 'ticket_abrir') {
      const tipos = getTipos();
      if (tipos.length === 0) {
        return interaction.reply({ content: '❌ Nenhum tipo de ticket configurado. Avise um admin.', ephemeral: true });
      }

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_tipo_menu')
        .setPlaceholder('Escolha o tipo de atendimento')
        .addOptions(tipos.map(t => ({
          label: t.nome.slice(0, 100),
          value: t.id,
          emoji: t.emoji,
        })));

      await interaction.reply({
        content: '🎫 **Escolha o tipo de ticket:**',
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true,
      });
      return;
    }

    // --- Ticket: reivindicar ---
    if (interaction.customId === 'ticket_reivindicar') {
      const ticket = ticketsAbertos.get(interaction.channel.id);
      if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });

      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Só admins podem reivindicar.', ephemeral: true });
      }

      if (ticket.reivindicadoPor) {
        return interaction.reply({ content: `⚠️ Já foi reivindicado por <@${ticket.reivindicadoPor}>.`, ephemeral: true });
      }

      ticket.reivindicadoPor = userId;

      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setDescription(`✋ **TICKET REIVINDICADO** por <@${userId}>`)
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Você reivindicou este ticket.', ephemeral: true });

      // Log
      const logsId = getLogsChannel();
      if (logsId) {
        const logsCanal = interaction.guild.channels.cache.get(logsId);
        if (logsCanal) {
          await logsCanal.send({
            embeds: [new EmbedBuilder().setColor(0xf1c40f).setDescription(`✋ Ticket <#${interaction.channel.id}> reivindicado por <@${userId}>`)],
          });
        }
      }
      return;
    }

    // --- Ticket: fechar ---
    if (interaction.customId === 'ticket_fechar') {
      const ticket = ticketsAbertos.get(interaction.channel.id);
      if (!ticket) return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });

      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Só admins podem fechar.', ephemeral: true });
      }

      await interaction.reply({ content: '🔒 Fechando ticket em 5 segundos...' });

      // Log antes de fechar
      const logsId = getLogsChannel();
      if (logsId) {
        const logsCanal = interaction.guild.channels.cache.get(logsId);
        if (logsCanal) {
          await logsCanal.send({
            embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription(`🔒 Ticket <#${interaction.channel.id}> fechado por <@${userId}>`)],
          });
        }
      }

      setTimeout(async () => {
        try {
          ticketsAbertos.delete(interaction.channel.id);
          await interaction.channel.delete();
        } catch (err) { console.error('Erro ao fechar ticket:', err); }
      }, 5000);
      return;
    }

    // --- Ticketedit: adicionar ---
    if (interaction.customId === 'ticketedit_add') {
      const modal = {
        title: 'Adicionar Tipo de Ticket',
        custom_id: 'ticketedit_add_modal',
        components: [
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'nome',
              label: 'Nome do tipo',
              style: 1,
              min_length: 1,
              max_length: 80,
              required: true,
            }],
          },
          {
            type: 1,
            components: [{
              type: 4,
              custom_id: 'emoji',
              label: 'Emoji (opcional)',
              style: 1,
              min_length: 0,
              max_length: 5,
              required: false,
            }],
          },
        ],
      };
      await interaction.showModal(modal);
      return;
    }

    // --- Ticketedit: remover ---
    if (interaction.customId === 'ticketedit_remove') {
      const tipos = getTipos();
      if (tipos.length === 0) return interaction.reply({ content: '❌ Nenhum tipo pra remover.', ephemeral: true });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticketedit_remove_menu')
        .setPlaceholder('Selecione os tipos pra remover')
        .setMinValues(1)
        .setMaxValues(tipos.length)
        .addOptions(tipos.map(t => ({ label: t.nome.slice(0, 100), value: t.id })));

      return interaction.reply({
        content: '🗑️ Selecione o(s) tipo(s) pra remover:',
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true,
      });
    }

    // --- Ticketedit: foto ---
    if (interaction.customId === 'ticketedit_foto') {
      const tipos = getTipos();
      if (tipos.length === 0) return interaction.reply({ content: '❌ Nenhum tipo cadastrado.', ephemeral: true });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticketedit_foto_menu')
        .setPlaceholder('Escolha o tipo pra adicionar foto')
        .addOptions(tipos.map(t => ({ label: t.nome.slice(0, 100), value: t.id })));

      return interaction.reply({
        content: '🖼️ Escolha o tipo:',
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true,
      });
    }
  }

  // ========== Modals ==========
  if (interaction.isModalSubmit() && interaction.customId === 'ticketedit_add_modal') {
    const nome = interaction.fields.getTextInputValue('nome');
    const emoji = interaction.fields.getTextInputValue('emoji') || '🎫';
    const tipo = addTipo(nome, emoji);
    await interaction.reply({
      content: `✅ Tipo **${emoji} ${nome}** adicionado! (ID: \`${tipo.id}\`)`,
      ephemeral: true,
    });
    return;
  }
});

// ========== Listener: salvar foto quando o admin manda ==========
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const tipoId = esperandoFoto.get(message.author.id);
  if (!tipoId) return;

  const anexo = message.attachments.first();
  if (!anexo) return;

  if (!anexo.contentType?.startsWith('image/')) {
    return message.reply('⚠️ Manda uma **imagem** (png, jpg, etc).');
  }

  setFotoTipo(tipoId, anexo.url);
  esperandoFoto.delete(message.author.id);

  await message.reply(`✅ Foto salva no tipo!`);
});

// ========== Bot online ==========
client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`📡 Servindo ${client.guilds.cache.size} servidor(es)`);
});

// ========== Express ==========
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot online! 🤖'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`🌐 Web server na porta ${PORT}`));

// ========== Login ==========
console.log('🔑 Tentando logar...');
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Login OK'))
  .catch((err) => { console.error('❌ Erro no login:', err.message); process.exit(1); });

// ========== Carrega e registra comandos ==========
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
