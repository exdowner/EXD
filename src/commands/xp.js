import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getXp } from '../utils/levels.js';

export const data = new SlashCommandBuilder()
  .setName('xp')
  .setDescription('Mostra seu XP total')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const { xp } = getXp(user.id);
  await interaction.reply({ content: `✨ **${user.username}** tem **${xp}** XP.` });
}
