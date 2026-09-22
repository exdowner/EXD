import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSaldo, addSaldo, addBanco } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('depositar')
  .setDescription('Deposita pontos no banco')
  .addIntegerOption(o => o.setName('quantidade').setDescription('Quanto depositar').setRequired(true).setMinValue(1));

export async function execute(interaction) {
  const q = interaction.options.getInteger('quantidade');
  const saldo = getSaldo(interaction.user.id);

  if (saldo < q) return interaction.reply({ content: `❌ Você só tem **${saldo}**.`, ephemeral: true });

  addSaldo(interaction.user.id, -q);
  addBanco(interaction.user.id, q);

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🏦 Depositaste **${q}** pontos.`)] });
}
