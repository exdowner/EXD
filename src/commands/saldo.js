import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSaldo, getBanco } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('saldo')
  .setDescription('Ver seu saldo ou de outro usuário')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const s = getSaldo(user.id);
  const b = getBanco(user.id);

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle(`💰 Carteira de ${user.username}`)
    .addFields(
      { name: '👛 Mão', value: `${s} pontos`, inline: true },
      { name: '🏦 Banco', value: `${b} pontos`, inline: true },
      { name: '📊 Total', value: `${s + b} pontos`, inline: true },
    );
  await interaction.reply({ embeds: [embed] });
}
