import { SlashCommandBuilder } from 'discord.js';
import { isDono } from '../utils/dono.js';

export const data = new SlashCommandBuilder()
  .setName('broadcast')
  .setDescription('Manda mensagem em todos os servidores (dono)')
  .addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true));

export async function execute(interaction) {
  if (!isDono(interaction.user.id)) return interaction.reply({ content: '❌ Só o dono.', ephemeral: true });
  await interaction.reply({ content: '📢 Enviando...', ephemeral: true });
  const msg = interaction.options.getString('mensagem');
  let ok = 0;
  for (const [, guild] of interaction.client.guilds.cache) {
    const canal = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
    if (canal) { try { await canal.send(msg); ok++; } catch {} }
  }
  await interaction.followUp({ content: `✅ Enviado em ${ok} servidor(es).`, ephemeral: true });
}
