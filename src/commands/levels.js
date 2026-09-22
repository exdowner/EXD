import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getXp } from '../utils/levels.js';

export const data = new SlashCommandBuilder()
  .setName('levels')
  .setDescription('Ranking de níveis do servidor');

export async function execute(interaction) {
  const membros = interaction.guild.members.cache.filter(m => !m.user.bot);
  const rank = membros.map(m => ({ id: m.id, ...getXp(m.id) }))
    .sort((a, b) => b.xp - a.xp).slice(0, 10);

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🏆 Ranking de Níveis')
    .setDescription(rank.map((r, i) => `**${i + 1}.** <@${r.id}> — Nível ${r.level} (${r.xp} XP)`).join('\n'));
  await interaction.reply({ embeds: [embed] });
}
