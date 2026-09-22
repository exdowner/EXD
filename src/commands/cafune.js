import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('cafune')
  .setDescription('Faz cafuné em alguém')
  .addUserOption(o => o.setName('usuario').setDescription('Alvo').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffb6c1).setDescription(`🥰 <@${interaction.user.id}> fez cafuné em <@${user.id}>!`)] });
}
