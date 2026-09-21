import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addPontos, removePontos, getPontos } from '../utils/banco.js';

export const data = new SlashCommandBuilder()
  .setName('darpontos')
  .setDescription('Dá ou tira pontos de um usuário (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem recebe').setRequired(true))
  .addIntegerOption(opt =>
    opt.setName('quantidade').setDescription('Quantidade (use negativo pra tirar)').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const qtd = interaction.options.getInteger('quantidade');

  if (qtd >= 0) addPontos(user.id, qtd);
  else removePontos(user.id, Math.abs(qtd));

  const embed = new EmbedBuilder()
    .setColor(qtd >= 0 ? 0x2ecc71 : 0xe74c3c)
    .setDescription(
      `${qtd >= 0 ? '✅' : '❌'} ${qtd >= 0 ? 'Adicionado' : 'Removido'} **${Math.abs(qtd)}** pontos de <@${user.id}>\n` +
      `💰 Novo saldo: **${getPontos(user.id)}**`
    );

  await interaction.reply({ embeds: [embed] });
}
