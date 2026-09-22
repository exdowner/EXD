import { SlashCommandBuilder } from 'discord.js';
import { isDono } from '../utils/dono.js';

export const data = new SlashCommandBuilder()
  .setName('eval')
  .setDescription('Executa código (dono)')
  .addStringOption(o => o.setName('codigo').setDescription('Código JS').setRequired(true));

export async function execute(interaction) {
  if (!isDono(interaction.user.id)) return interaction.reply({ content: '❌ Só o dono.', ephemeral: true });
  const code = interaction.options.getString('codigo');
  try {
    let r = await eval(code);
    if (typeof r !== 'string') r = require('util').inspect(r);
    await interaction.reply({ content: `\`\`\`\n${String(r).slice(0, 1900)}\n\`\`\``, ephemeral: true });
  } catch (e) {
    await interaction.reply({ content: `❌ ${e.message}`, ephemeral: true });
  }
}
