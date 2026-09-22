import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('suporte').setDescription('Como conseguir suporte');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🆘 Suporte')
    .setDescription('Abra um ticket usando o painel de atendimento no canal configurado.');
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
