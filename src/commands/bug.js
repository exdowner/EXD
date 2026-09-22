import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLogsChannel } from '../utils/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('bug')
  .setDescription('Reporta um bug')
  .addStringOption(o => o.setName('descricao').setDescription('Descreva o bug').setRequired(true));

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🐛 Bug Reportado')
    .setDescription(interaction.options.getString('descricao'))
    .setFooter({ text: `Por ${interaction.user.tag}` })
    .setTimestamp();

  const logsId = getLogsChannel();
  const canalLogs = logsId ? interaction.guild.channels.cache.get(logsId) : null;

  await interaction.reply({ content: '✅ Bug reportado!', ephemeral: true });

  if (canalLogs) {
    await canalLogs.send({ embeds: [embed] });
  } else {
    await interaction.channel.send({ embeds: [embed] });
  }
}
