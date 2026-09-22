import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ajuda')
  .setDescription('Lista todos os comandos do bot');

export async function execute(interaction) {
  const cmds = interaction.client.commands.map(c => `\`/${c.data.name}\``).join(' ');
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📚 Comandos Disponíveis')
    .setDescription(cmds || 'Nenhum.')
    .setFooter({ text: `Total: ${interaction.client.commands.size} comandos` });
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
