import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('say')
  .setDescription('Faz o bot repetir uma mensagem')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption(o => o.setName('texto').setDescription('O que dizer').setRequired(true))
  .addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(false));

export async function execute(interaction) {
  const texto = interaction.options.getString('texto');
  const canal = interaction.options.getChannel('canal') || interaction.channel;
  await interaction.reply({ content: '✅', ephemeral: true });
  await canal.send(texto);
}
