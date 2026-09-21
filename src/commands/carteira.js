import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPontos, ranking } from '../utils/banco.js';

export const data = new SlashCommandBuilder()
  .setName('carteira')
  .setDescription('Mostra sua carteira de pontos')
  .addUserOption(opt =>
    opt.setName('usuario')
      .setDescription('Ver carteira de outro usuário')
      .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const pontos = getPontos(user.id);

  const top = ranking().slice(0, 5);
  const topFormatado = top.length > 0
    ? top.map(([id, pts], i) => `**${i + 1}.** <@${id}> — ${pts} pts`).join('\n')
    : 'Ninguém pontuou ainda.';

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(`💰 Carteira de ${user.username}`)
    .setThumbnail(user.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: '💵 Saldo atual', value: `**${pontos}** pontos` },
      { name: '🏆 Top 5 do servidor', value: topFormatado }
    );

  await interaction.reply({ embeds: [embed] });
}
