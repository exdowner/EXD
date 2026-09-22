import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('dado')
  .setDescription('Rola um dado')
  .addIntegerOption(o => o.setName('lados').setDescription('Número de lados (padrão 6)').setMinValue(2).setRequired(false));

export async function execute(interaction) {
  const lados = interaction.options.getInteger('lados') || 6;
  const r = Math.floor(Math.random() * lados) + 1;
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🎲 Caiu **${r}** (d${lados})`)] });
}
