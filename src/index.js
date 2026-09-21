import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import express from 'express';
import { loadCommands } from './handlers/commandHandler.js';

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Erro no comando ${interaction.commandName}:`, error);
    const msg = { content: '❌ Deu erro ao executar esse comando.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`📡 Servindo ${client.guilds.cache.size} servidor(es)`);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot online! 🤖'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.listen(PORT, () => console.log(`🌐 Web server na porta ${PORT}`));

console.log('🔑 Tentando logar...');

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Login OK'))
  .catch((err) => {
    console.error('❌ Erro no login:', err.message);
    process.exit(1);
  });

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
