import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPontos } from '../utils/banco.js';

export const data = new SlashCommandBuilder()
  .setName('perfil')
  .setDescription('Mostra o perfil de um usuário')
  .addUserOption(opt =>
    opt.setName('usuario')
      .setDescription('Usuário pra ver o perfil (opcional)')
      .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const member = await interaction.guild.members.fetch(user.id);
  const pontos = getPontos(user.id);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`👤 Perfil de ${user.username}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '💰 Pontos', value: `${pontos}`, inline: true },
      { name: '📅 Entrou no servidor', value: member.joinedAt?.toLocaleDateString('pt-BR') || 'Desconhecido', inline: true },
      { name: '🎂 Conta criada', value: user.createdAt.toLocaleDateString('pt-BR'), inline: true }
    )
    .setFooter({ text: `ID: ${user.id}` });

  await interaction.reply({ embeds: [embed] });
}
