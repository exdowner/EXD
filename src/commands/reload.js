import { SlashCommandBuilder } from 'discord.js';
import { isDono } from '../utils/dono.js';
import { loadCommands } from '../handlers/commandHandler.js';

export const data = new SlashCommandBuilder().setName('reload').setDescription('Recarrega comandos (dono)');

export async function execute(interaction) {
  if (!isDono(interaction.user.id)) return interaction.reply({ content: '❌ Só o dono.', ephemeral: true });
  interaction.client.commands.clear();
  await loadCommands(interaction.client);
  await interaction.reply({ content: `✅ **${interaction.client.commands.size}** comando(s) recarregado(s).`, ephemeral: true });
}
