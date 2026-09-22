import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getSaldo, addSaldo } from '../utils/economia.js';

export const data = new SlashCommandBuilder()
  .setName('transferir')
  .setDescription('Transfere pontos pra outro usuário')
  .addUserOption(o => o.setName('usuario').setDescription('Quem recebe').setRequired(true))
  .addIntegerOption(o => o.setName('quantidade').setDescription('Quanto').setRequired(true).setMinValue(1));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const q = interaction.options.getInteger('quantidade');

  if (user.bot || user.id === interaction.user.id)
    return interaction.reply({ content: '❌ Usuário inválido.', ephemeral: true });

  if (getSaldo(interaction.user.id) < q)
    return interaction.reply({ content: '❌ Saldo insuficiente.', ephemeral: true });

  addSaldo(interaction.user.id, -q);
  addSaldo(user.id, q);

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`💸 Transferiste **${q}** pontos pra <@${user.id}>.`)] });
}
