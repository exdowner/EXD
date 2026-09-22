import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('abraçar')
  .setDescription('Abraça alguém')
  .addUserOption(o => o.setName('usuario').setDescription('Alvo').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffa500).setDescription(`🤗 <@${interaction.user.id}> abraçou <@${user.id}>!`)] });
}
