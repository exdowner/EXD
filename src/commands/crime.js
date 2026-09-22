import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addSaldo, cooldownRestante } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('crime')
  .setDescription('Comete um crime (pode dar certo ou errado)');

export async function execute(interaction) {
  const cd = cooldownRestante(interaction.user.id, 'crime', 7200);
  if (cd > 0) return interaction.reply({ content: '⏰ Espere um pouco.', ephemeral: true });

  const sucesso = Math.random() < 0.6;
  if (sucesso) {
    const valor = 200 + Math.floor(Math.random() * 300);
    addSaldo(interaction.user.id, valor);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🦹 Crime bem-sucedido! Você roubou **${valor}** pontos.`)] });
  } else {
    const multa = 100 + Math.floor(Math.random() * 200);
    addSaldo(interaction.user.id, -multa);
    return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription(`🚔 Você foi pego! Multa de **${multa}** pontos.`)] });
  }
    }
