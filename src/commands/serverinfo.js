import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Informações do servidor');

export async function execute(interaction) {
  const g = interaction.guild;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📊 ${g.name}`)
    .setThumbnail(g.iconURL({ size: 256 }))
    .addFields(
      { name: '👑 Dono', value: `<@${g.ownerId}>`, inline: true },
      { name: '🆔 ID', value: g.id, inline: true },
      { name: '📅 Criado', value: g.createdAt.toLocaleDateString('pt-BR'), inline: true },
      { name: '👥 Membros', value: `${g.memberCount}`, inline: true },
      { name: '💬 Canais', value: `${g.channels.cache.size}`, inline: true },
      { name: '🎭 Cargos', value: `${g.roles.cache.size}`, inline: true },
      { name: '😀 Emojis', value: `${g.emojis.cache.size}`, inline: true },
      { name: '🚀 Boosts', value: `${g.premiumSubscriptionCount || 0}`, inline: true },
    );
  await interaction.reply({ embeds: [embed] });
}
