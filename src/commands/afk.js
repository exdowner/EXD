import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const afks = new Map();

export const data = new SlashCommandBuilder()
  .setName('afk')
  .setDescription('Define seu status AFK')
  .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(false));

export async function execute(interaction) {
  const motivo = interaction.options.getString('motivo') || 'Sem motivo';
  afks.set(interaction.user.id, motivo);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x95a5a6).setDescription(`💤 <@${interaction.user.id}> tá AFK: **${motivo}**`)] });
}
