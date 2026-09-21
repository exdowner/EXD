import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { setLogsCompras } from '../utils/loja.js';

export const data = new SlashCommandBuilder()
  .setName('setlogscompras')
  .setDescription('Define o canal que vai receber os comprovantes de compra')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(opt =>
    opt.setName('canal')
      .setDescription('Canal de texto pra receber comprovantes')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true));

export async function execute(interaction) {
  const canal = interaction.options.getChannel('canal');
  setLogsCompras(canal.id);

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setDescription(`✅ Canal de comprovantes definido: <#${canal.id}>`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
