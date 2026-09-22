import { SlashCommandBuilder, EmbedBuilder, ActivityType } from 'discord.js';
import { isDono } from '../utils/dono.js';

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Muda o status do bot (dono)')
  .addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true))
  .addStringOption(o => o.setName('tipo').setDescription('Tipo').setRequired(false)
    .addChoices(
      { name: 'Jogando', value: 'playing' },
      { name: 'Assistindo', value: 'watching' },
      { name: 'Ouvindo', value: 'listening' },
    ));

export async function execute(interaction) {
  if (!isDono(interaction.user.id)) return interaction.reply({ content: '❌ Só o dono.', ephemeral: true });
  const texto = interaction.options.getString('texto');
  const tipo = interaction.options.getString('tipo') || 'playing';
  const types = { playing: ActivityType.Playing, watching: ActivityType.Watching, listening: ActivityType.Listening };
  interaction.client.user.setActivity(texto, { type: types[tipo] });
  await interaction.reply({ content: `✅ Status: **${texto}**`, ephemeral: true });
}
