import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('beijar')
  .setDescription('Beija alguém')
  .addUserOption(o => o.setName('usuario').setDescription('Alvo').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff69b4).setDescription(`💋 <@${interaction.user.id}> beijou <@${user.id}>!`)] });
}
