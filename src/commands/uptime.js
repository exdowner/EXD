import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('Tempo que o bot tá online');

export async function execute(interaction) {
  const up = process.uptime();
  const d = Math.floor(up / 86400);
  const h = Math.floor((up % 86400) / 3600);
  const m = Math.floor((up % 3600) / 60);
  const s = Math.floor(up % 60);

  await interaction.reply({
    embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`⏰ **Uptime:** ${d}d ${h}h ${m}m ${s}s`)],
  });
}
