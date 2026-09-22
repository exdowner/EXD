import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSaldo, getBanco } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('ranking')
  .setDescription('Ranking dos mais ricos do servidor');

export async function execute(interaction) {
  const membros = interaction.guild.members.cache;
  const ranking = membros.map(m => ({
    id: m.id,
    total: getSaldo(m.id) + getBanco(m.id),
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total).slice(0, 10);

  if (ranking.length === 0) return interaction.reply({ content: '❌ Ninguém tem pontos ainda.', ephemeral: true });

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle('🏆 Ranking de Riqueza')
    .setDescription(ranking.map((r, i) => `**${i + 1}.** <@${r.id}> — ${r.total} pts`).join('\n'));

  await interaction.reply({ embeds: [embed] });
}
