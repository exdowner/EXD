import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Mostra a latência do bot.');

export async function execute(interaction) {
  const latency = Date.now() - interaction.createdTimestamp;
  await interaction.reply({
    content: `🏓 Pong!\n**Latência:** ${latency}ms\n**API:** ${Math.round(interaction.client.ws.ping)}ms`,
    ephemeral: true,
  });
}
