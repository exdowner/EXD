import { SlashCommandBuilder } from 'discord.js';
import { isDono } from '../utils/dono.js';

export const data = new SlashCommandBuilder()
  .setName('maintenance')
  .setDescription('Ativa/desativa modo manutenção (dono)')
  .addBooleanOption(o => o.setName('ativar').setDescription('Ativar?').setRequired(true));

export async function execute(interaction) {
  if (!isDono(interaction.user.id)) return interaction.reply({ content: '❌ Só o dono.', ephemeral: true });
  const on = interaction.options.getBoolean('ativar');
  global.maintenance = on;
  await interaction.reply({ content: on ? '🚧 Manutenção ativada.' : '✅ Manutenção desativada.', ephemeral: true });
}
