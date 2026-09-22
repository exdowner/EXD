import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('tapa')
  .setDescription('Dá um tapa em alguém')
  .addUserOption(o => o.setName('usuario').setDescription('Alvo').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription(`👋 <@${interaction.user.id}> deu um tapa em <@${user.id}>!`)] });
}
