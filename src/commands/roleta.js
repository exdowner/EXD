import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('roleta')
  .setDescription('Gira a roleta russa 🔫');

export async function execute(interaction) {
  const r = Math.floor(Math.random() * 6) + 1;
  const morreu = r === 1;
  const embed = new EmbedBuilder()
    .setColor(morreu ? 0xe74c3c : 0x2ecc71)
    .setDescription(morreu
      ? `💥 **BANG!** <@${interaction.user.id}> não sobreviveu...`
      : `😅 *click* <@${interaction.user.id}> sobreviveu!`);
  await interaction.reply({ embeds: [embed] });
}
