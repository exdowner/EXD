import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('gaymeter')
  .setDescription('Mede o quão gay alguém é 🏳️‍🌈')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  let hash = 0;
  for (const c of user.id + Date.now().toString().slice(0, -3)) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  const pct = Math.abs(hash) % 101;
  const barra = '🌈'.repeat(Math.floor(pct / 10)) + '⬛'.repeat(10 - Math.floor(pct / 10));
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff69b4).setDescription(`🏳️‍🌈 **${user.username}** é **${pct}%** gay!\n${barra}`)] });
}
