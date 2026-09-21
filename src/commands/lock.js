import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Tranca o canal atual')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    { SendMessages: false }
  );

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setDescription('🔒 Canal **trancado**. Só admins podem falar.');

  await interaction.reply({ embeds: [embed] });
}
