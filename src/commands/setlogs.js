import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { setLogsChannel } from '../utils/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('setlogs')
  .setDescription('Define o canal onde vão os logs de ticket')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addChannelOption(opt =>
    opt.setName('canal')
      .setDescription('Canal de texto pra receber os logs')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true));

export async function execute(interaction) {
  const canal = interaction.options.getChannel('canal');
  setLogsChannel(canal.id);

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setDescription(`✅ Canal de logs definido: <#${canal.id}>`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
