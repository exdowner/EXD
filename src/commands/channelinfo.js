import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

const TIPOS = {
  [ChannelType.GuildText]: '💬 Texto',
  [ChannelType.GuildVoice]: '🔊 Voz',
  [ChannelType.GuildCategory]: '📁 Categoria',
  [ChannelType.GuildAnnouncement]: '📢 Anúncio',
  [ChannelType.GuildStageVoice]: '🎤 Palco',
  [ChannelType.GuildForum]: '📋 Fórum',
};

export const data = new SlashCommandBuilder()
  .setName('channelinfo')
  .setDescription('Informações de um canal')
  .addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(false));

export async function execute(interaction) {
  const canal = interaction.options.getChannel('canal') || interaction.channel;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📌 #${canal.name}`)
    .addFields(
      { name: '🆔 ID', value: canal.id, inline: true },
      { name: '📁 Tipo', value: TIPOS[canal.type] || 'Outro', inline: true },
      { name: '📅 Criado', value: canal.createdAt.toLocaleDateString('pt-BR'), inline: true },
    );

  if (canal.parent) embed.addFields({ name: '📂 Categoria', value: canal.parent.name, inline: true });
  if (canal.topic) embed.addFields({ name: '📝 Tópico', value: canal.topic.slice(0, 1000) });
  if (canal.nsfw !== undefined) embed.addFields({ name: '🔞 NSFW', value: canal.nsfw ? 'Sim' : 'Não', inline: true });

  await interaction.reply({ embeds: [embed] });
}
