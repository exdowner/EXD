import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('sugestao')
  .setDescription('Envia uma sugestão')
  .addStringOption(o => o.setName('texto').setDescription('Sua sugestão').setRequired(true));

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('💡 Sugestão')
    .setDescription(interaction.options.getString('texto'))
    .setFooter({ text: `Por ${interaction.user.tag}` });
  await interaction.reply({ content: '✅ Sugestão enviada!', ephemeral: true });
  await interaction.channel.send({ embeds: [embed] });
}
