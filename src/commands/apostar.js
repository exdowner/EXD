import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSaldo, addSaldo } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('apostar')
  .setDescription('Aposta pontos num jogo 50/50')
  .addIntegerOption(o => o.setName('quantidade').setDescription('Quanto apostar').setRequired(true).setMinValue(1));

export async function execute(interaction) {
  const q = interaction.options.getInteger('quantidade');
  if (getSaldo(interaction.user.id) < q)
    return interaction.reply({ content: '❌ Saldo insuficiente.', ephemeral: true });

  const ganhou = Math.random() < 0.5;
  if (ganhou) {
    addSaldo(interaction.user.id, q);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🎉 Você ganhou **${q}** pontos!`)] });
  } else {
    addSaldo(interaction.user.id, -q);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription(`💀 Você perdeu **${q}** pontos.`)] });
  }
}
