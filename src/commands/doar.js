import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('doar').setDescription('Como doar pro projeto');

export async function execute(interaction) {
  const embed = new EmbedBuilder().setColor(0xf1c40f).setTitle('💖 Doar').setDescription('Obrigado pelo interesse! Fale com um admin pra saber como apoiar.');
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
