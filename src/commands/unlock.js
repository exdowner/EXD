import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Destranca o canal atual')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(
    interaction.guild.roles.everyone,
    { SendMessages: true }
  );

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setDescription('🔓 Canal **destrancado**. Todos podem falar.');

  await interaction.reply({ embeds: [embed] });
}
