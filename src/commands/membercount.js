import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('membercount')
  .setDescription('Contagem de membros do servidor');

export async function execute(interaction) {
  const g = interaction.guild;
  const humanos = g.members.cache.filter(m => !m.user.bot).size;
  const bots = g.members.cache.filter(m => m.user.bot).size;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('👥 Contagem de Membros')
    .addFields(
      { name: '👤 Humanos', value: `${humanos}`, inline: true },
      { name: '🤖 Bots', value: `${bots}`, inline: true },
      { name: '📊 Total', value: `${g.memberCount}`, inline: true },
    );
  await interaction.reply({ embeds: [embed] });
}
