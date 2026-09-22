import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { addSaldo, cooldownRestante } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Resgata sua recompensa diária');

export async function execute(interaction) {
  const cd = cooldownRestante(interaction.user.id, 'daily', 86400);
  if (cd > 0) {
    const h = Math.floor(cd / 3600000);
    const m = Math.floor((cd % 3600000) / 60000);
    return interaction.reply({ content: `⏰ Espere **${h}h ${m}m** pro próximo daily.`, ephemeral: true });
  }

  const valor = 100 + Math.floor(Math.random() * 100);
  addSaldo(interaction.user.id, valor);

  await interaction.reply({
    embeds: [new EmbedBuilder().setColor(0xf1c40f).setDescription(`🎁 Você ganhou **${valor}** pontos no daily!`)],
  });
}
