import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setXp } from '../utils/levels.js';

export const data = new SlashCommandBuilder()
  .setName('setxp')
  .setDescription('Define o XP de um usuário (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
  .addIntegerOption(o => o.setName('quantidade').setDescription('XP').setRequired(true).setMinValue(0));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const q = interaction.options.getInteger('quantidade');
  const r = setXp(user.id, q);
  await interaction.reply({ content: `✅ XP de <@${user.id}> definido em **${r.xp}** (nível ${r.level}).`, ephemeral: true });
}
