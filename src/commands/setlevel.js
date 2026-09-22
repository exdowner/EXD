import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('setlevel')
  .setDescription('Ajusta a config de XP (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addIntegerOption(o => o.setName('min').setDescription('XP mínimo por msg').setRequired(false).setMinValue(1))
  .addIntegerOption(o => o.setName('max').setDescription('XP máximo por msg').setRequired(false).setMinValue(1))
  .addIntegerOption(o => o.setName('cooldown').setDescription('Cooldown em segundos').setRequired(false).setMinValue(1));

export async function execute(interaction) {
  await interaction.reply({ content: '⚠️ A config de XP fica no código (`src/utils/levels.js`). Edita lá e reinicia.', ephemeral: true });
}
