import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addSaldo, cooldownRestante } from '../utils/economia.js';

const TRABALHOS = ['programador', 'entregador', 'professor', 'cozinheiro', 'youtuber', 'streamer'];

export const data = new SlashCommandBuilder()
  .setName('work')
  .setDescription('Trabalha pra ganhar pontos');

export async function execute(interaction) {
  const cd = cooldownRestante(interaction.user.id, 'work', 3600);
  if (cd > 0) {
    const m = Math.ceil(cd / 60000);
    return interaction.reply({ content: `⏰ Descanse **${m}m**.`, ephemeral: true });
  }

  const valor = 50 + Math.floor(Math.random() * 100);
  const trabalho = TRABALHOS[Math.floor(Math.random() * TRABALHOS.length)];
  addSaldo(interaction.user.id, valor);

  await interaction.reply({
    embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`💼 Você trabalhou como **${trabalho}** e ganhou **${valor}** pontos!`)],
  });
}
