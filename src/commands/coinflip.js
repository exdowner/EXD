import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addPontos, removePontos, getPontos } from '../utils/banco.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Joga uma moeda: cara ou coroa')
  .addIntegerOption(opt =>
    opt.setName('aposta')
      .setDescription('Quantos pontos apostar (opcional)')
      .setMinValue(1)
      .setRequired(false));

export async function execute(interaction) {
  const aposta = interaction.options.getInteger('aposta');
  const userId = interaction.user.id;
  const resultado = Math.random() < 0.5 ? 'cara' : 'coroa';
  const escolha = Math.random() < 0.5 ? 'cara' : 'coroa';

  let msg = `🪙 Caiu **${resultado}**!`;

  if (aposta) {
    const saldo = getPontos(userId);
    if (saldo < aposta) {
      return interaction.reply({
        content: `❌ Você só tem **${saldo}** pontos.`,
        ephemeral: true
      });
    }

    if (resultado === escolha) {
      addPontos(userId, aposta);
      msg += `\n✅ Você ganhou **${aposta}** pontos!`;
    } else {
      removePontos(userId, aposta);
      msg += `\n❌ Você perdeu **${aposta}** pontos.`;
    }
    msg += `\n💰 Saldo: **${getPontos(userId)}**`;
  }

  const embed = new EmbedBuilder()
    .setColor(resultado === 'cara' ? 0xf1c40f : 0x95a5a6)
    .setTitle('🪙 Coinflip')
    .setDescription(msg);

  await interaction.reply({ embeds: [embed] });
}
