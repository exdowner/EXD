import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { addXp } from '../utils/levels.js';

export const data = new SlashCommandBuilder()
  .setName('addxp')
  .setDescription('Adiciona XP a um usuário (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
  .addIntegerOption(o => o.setName('quantidade').setDescription('XP').setRequired(true).setMinValue(1));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const q = interaction.options.getInteger('quantidade');
  const r = addXp(user.id, q);
  await interaction.reply({ content: `✅ Adicionado **${q}** XP pra <@${user.id}>. Agora: ${r.xp} XP (nível ${r.level}).`, ephemeral: true });
}
