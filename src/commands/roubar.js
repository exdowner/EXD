import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSaldo, addSaldo, cooldownRestante } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('roubar')
  .setDescription('Tenta roubar pontos de alguém')
  .addUserOption(o => o.setName('usuario').setDescription('Vítima').setRequired(true));

export async function execute(interaction) {
  const alvo = interaction.options.getUser('usuario');
  if (alvo.bot || alvo.id === interaction.user.id)
    return interaction.reply({ content: '❌ Alvo inválido.', ephemeral: true });

  const cd = cooldownRestante(interaction.user.id, 'roubar', 1800);
  if (cd > 0) return interaction.reply({ content: '⏰ Espere antes de roubar de novo.', ephemeral: true });

  const saldoAlvo = getSaldo(alvo.id);
  if (saldoAlvo < 10) return interaction.reply({ content: '❌ O alvo tá liso.', ephemeral: true });

  if (Math.random() < 0.4) {
    const valor = Math.floor(saldoAlvo * 0.2);
    addSaldo(alvo.id, -valor);
    addSaldo(interaction.user.id, valor);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🦹 Você roubou **${valor}** pontos de <@${alvo.id}>!`)] });
  } else {
    const multa = 50 + Math.floor(Math.random() * 100);
    addSaldo(interaction.user.id, -multa);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription(`🚔 Você foi pego! Multa de **${multa}** pontos.`)] });
  }
}
