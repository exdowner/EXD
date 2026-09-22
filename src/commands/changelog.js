import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('changelog').setDescription('Últimas atualizações do bot');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📝 Changelog')
    .setDescription('**v1.0.0**\n- Bot criado\n- Moderação básica\n- Economia\n- Tickets\n- Loja');
  await interaction.reply({ embeds: [embed] });
}
