import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Informações de um usuário')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`👤 ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '🆔 ID', value: user.id, inline: true },
      { name: '🤖 Bot?', value: user.bot ? 'Sim' : 'Não', inline: true },
      { name: '📅 Conta criada', value: user.createdAt.toLocaleDateString('pt-BR'), inline: true },
    );

  if (member) {
    embed.addFields(
      { name: '📥 Entrou em', value: member.joinedAt.toLocaleDateString('pt-BR'), inline: true },
      { name: '🎭 Cargo mais alto', value: `${member.roles.highest}`, inline: true },
      { name: '🎨 Cor', value: `${member.displayHexColor}`, inline: true },
    );
  }

  await interaction.reply({ embeds: [embed] });
}
