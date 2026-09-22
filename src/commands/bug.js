import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('bug')
  .setDescription('Reporta um bug')
  .addStringOption(o => o.setName('descricao').setDescription('Descreva o bug').setRequired(true));

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🐛 Bug Reportado')
    .setDescription(interaction.options.getString('descricao'))
    .setFooter({ text: `Por ${interaction.user.tag}` });
  await interaction.reply({ content: '✅ Bug reportado!', ephemeral: true });
  await interaction.channel.send({ embeds: [embed] });
}
