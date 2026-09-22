import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { isDono } from '../utils/dono.js';

export const data = new SlashCommandBuilder().setName('guilds').setDescription('Lista servidores (dono)');

export async function execute(interaction) {
  if (!isDono(interaction.user.id)) return interaction.reply({ content: '❌ Só o dono.', ephemeral: true });
  const lista = interaction.client.guilds.cache.map(g => `**${g.name}** — ${g.memberCount} membros`).slice(0, 30).join('\n');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x3498db).setTitle(`📡 ${interaction.client.guilds.cache.size} servidores`).setDescription(lista || 'Nenhum')], ephemeral: true });
}
