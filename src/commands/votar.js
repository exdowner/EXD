import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('votar').setDescription('Vote no bot');

export async function execute(interaction) {
  const embed = new EmbedBuilder().setColor(0x2ecc71).setTitle('🗳️ Votar').setDescription('Em breve você poderá votar no bot em sites de bots!');
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
