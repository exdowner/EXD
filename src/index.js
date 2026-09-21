import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import express from 'express';
import { loadCommands } from './handlers/commandHandler.js';

// ====== Cliente do Discord ======
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

// ====== Handler de interações ======
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

// ====== Bot online ======
client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`📡 Servindo ${client.guilds.cache.size} servidor(es)`);
});

// ====== Express (pro Render não dormir) ======
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot online! 🤖'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.listen(PORT, () => console.log(`🌐 Web server na porta ${PORT}`));

// ====== Login com tratamento de erro ======
console.log('🔑 Tentando logar...');
console.log('Token existe?', process.env.DISCORD_TOKEN ? 'Sim' : 'NÃO');
console.log('Client ID existe?', process.env.CLIENT_ID ? 'Sim' : 'NÃO');
console.log('Guild ID existe?', process.env.GUILD_ID ? 'Sim' : 'NÃO');

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Login OK'))
  .catch((err) => {
    console.error('❌ Erro no login:', err.message);
    process.exit(1);
  });

// ====== Carrega os comandos DEPOIS ======
// (dentro de um bloco async para não travar o boot)
(async () => {
  try {
    await loadCommands(client);
  } catch (err) {
    console.error('⚠️ Erro ao carregar comandos:', err.message);
  }
})();
