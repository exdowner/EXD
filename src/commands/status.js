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
