import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('Envia um feedback')
  .addStringOption(o => o.setName('texto').setDescription('Seu feedback').setRequired(true));

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('💬 Feedback')
    .setDescription(interaction.options.getString('texto'))
    .setFooter({ text: `Por ${interaction.user.tag}` });
  await interaction.reply({ content: '✅ Feedback enviado!', ephemeral: true });
  await interaction.channel.send({ embeds: [embed] });
}
