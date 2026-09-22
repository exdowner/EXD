import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Envia um embed customizado')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))
  .addStringOption(o => o.setName('descricao').setDescription('Descrição').setRequired(true))
  .addStringOption(o => o.setName('cor').setDescription('Cor hex (ex: #ff0000)').setRequired(false));

export async function execute(interaction) {
  const t = interaction.options.getString('titulo');
  const d = interaction.options.getString('descricao');
  const c = interaction.options.getString('cor') || '#5865f2';
  const embed = new EmbedBuilder().setTitle(t).setDescription(d).setColor(c);
  await interaction.reply({ content: '✅', ephemeral: true });
  await interaction.channel.send({ embeds: [embed] });
}
