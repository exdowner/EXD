import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('sobre').setDescription('Sobre o bot');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('ℹ️ Sobre')
    .setDescription('Bot feito com Discord.js v14, hospedado no Render.')
    .addFields({ name: '👨‍💻 Dev', value: 'EXD', inline: true });
  await interaction.reply({ embeds: [embed] });
}
