import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addPontos, removePontos, getPontos } from '../utils/banco.js';

const MULTIPLICADORES = [
  { valor: 0, chance: 50, emoji: '💀' },
  { valor: 1, chance: 25, emoji: '😐' },
  { valor: 2, chance: 15, emoji: '😀' },
  { valor: 5, chance: 8, emoji: '🤩' },
  { valor: 10, chance: 2, emoji: '🐯' },
];

function sortear() {
  const total = MULTIPLICADORES.reduce((acc, m) => acc + m.chance, 0);
  let r = Math.random() * total;
  for (const m of MULTIPLICADORES) {
    r -= m.chance;
    if (r <= 0) return m;
  }
  return MULTIPLICADORES[0];
}

export const data = new SlashCommandBuilder()
  .setName('tigrinho')
  .setDescription('Joga no tigrinho 🐯')
  .addIntegerOption(opt =>
    opt.setName('aposta')
      .setDescription('Quantos pontos apostar')
      .setMinValue(1)
      .setRequired(true));

export async function execute(interaction) {
  const aposta = interaction.options.getInteger('aposta');
  const userId = interaction.user.id;
  const saldo = getPontos(userId);

  if (saldo < aposta) {
    return interaction.reply({
      content: `❌ Você só tem **${saldo}** pontos.`,
      ephemeral: true
    });
  }

  const resultado = sortear();
  const ganho = aposta * resultado.valor;

  if (resultado.valor === 0) {
    removePontos(userId, aposta);
  } else {
    addPontos(userId, ganho - aposta);
  }

  const embed = new EmbedBuilder()
    .setColor(resultado.valor >= 5 ? 0x00ff00 : resultado.valor === 0 ? 0xff0000 : 0xf1c40f)
    .setTitle('🐯 Tigrinho')
    .setDescription(
      `${resultado.emoji} Multiplicador: **${resultado.valor}x**\n\n` +
      `Aposta: **${aposta}**\n` +
      `Resultado: **${resultado.valor === 0 ? '-' + aposta : '+' + (ganho - aposta)}** pontos\n` +
      `💰 Saldo: **${getPontos(userId)}**`
    );

  await interaction.reply({ embeds: [embed] });
}
