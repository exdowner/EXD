import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('anuncio')
  .setDescription('Faz um anúncio')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))
  .addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true))
  .addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(false));

export async function execute(interaction) {
  const canal = interaction.options.getChannel('canal') || interaction.channel;
  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle(`📢 ${interaction.options.getString('titulo')}`)
    .setDescription(interaction.options.getString('mensagem'))
    .setFooter({ text: `Anunciado por ${interaction.user.username}` })
    .setTimestamp();
  await interaction.reply({ content: '✅', ephemeral: true });
  await canal.send({ content: '@everyone', embeds: [embed] });
}
