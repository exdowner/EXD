import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLogsChannel } from '../utils/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('Envia um feedback')
  .addStringOption(o => o.setName('texto').setDescription('Seu feedback').setRequired(true));

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('💬 Feedback')
    .setDescription(interaction.options.getString('texto'))
    .setFooter({ text: `Por ${interaction.user.tag}` })
    .setTimestamp();

  const logsId = getLogsChannel();
  const canalLogs = logsId ? interaction.guild.channels.cache.get(logsId) : null;

  await interaction.reply({ content: '✅ Feedback enviado!', ephemeral: true });

  if (canalLogs) {
    await canalLogs.send({ embeds: [embed] });
  } else {
    await interaction.channel.send({ embeds: [embed] });
  }
}
