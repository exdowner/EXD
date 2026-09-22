import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getBanco, addSaldo, addBanco } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('sacar')
  .setDescription('Saca pontos do banco')
  .addIntegerOption(o => o.setName('quantidade').setDescription('Quanto sacar').setRequired(true).setMinValue(1));

export async function execute(interaction) {
  const q = interaction.options.getInteger('quantidade');
  const banco = getBanco(interaction.user.id);

  if (banco < q) return interaction.reply({ content: `❌ Você só tem **${banco}** no banco.`, ephemeral: true });

  addBanco(interaction.user.id, -q);
  addSaldo(interaction.user.id, q);

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`💸 Sacaste **${q}** pontos.`)] });
}
