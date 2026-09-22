import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('pong').setDescription('Responde pong');
export async function execute(interaction) {
  await interaction.reply(`🏓 Pong! ${interaction.client.ws.ping}ms`);
}
