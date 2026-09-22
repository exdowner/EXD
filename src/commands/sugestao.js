import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLogsChannel } from '../utils/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('sugestao')
  .setDescription('Envia uma sugestão')
  .addStringOption(o => o.setName('texto').setDescription('Sua sugestão').setRequired(true));

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('💡 Sugestão')
    .setDescription(interaction.options.getString('texto'))
    .setFooter({ text: `Por ${interaction.user.tag}` })
    .setTimestamp();

  const logsId = getLogsChannel();
  const canalLogs = logsId ? interaction.guild.channels.cache.get(logsId) : null;

  await interaction.reply({ content: '✅ Sugestão enviada!', ephemeral: true });

  if (canalLogs) {
    await canalLogs.send({ embeds: [embed] });
  } else {
    await interaction.channel.send({ embeds: [embed] });
  }
}
