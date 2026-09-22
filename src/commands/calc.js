import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('calc')
  .setDescription('Calcula uma expressão matemática')
  .addStringOption(o => o.setName('expressao').setDescription('Ex: 2+2*3').setRequired(true));

export async function execute(interaction) {
  const exp = interaction.options.getString('expressao').replace(/[^0-9+\-*/().%\s]/g, '');
  try {
    const r = Function(`"use strict"; return (${exp})`)();
    await interaction.reply({ content: `🧮 \`${exp}\` = **${r}**` });
  } catch {
    await interaction.reply({ content: '❌ Expressão inválida.', ephemeral: true });
  }
}
