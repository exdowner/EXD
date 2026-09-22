import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getWarns, removeWarn, clearWarns } from '../utils/moderacao.js';

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('Mostra, remove ou limpa warnings de um usuário')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand(sub =>
    sub.setName('ver').setDescription('Ver warnings de um usuário')
      .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remover').setDescription('Remover um warning específico')
      .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
      .addStringOption(o => o.setName('id').setDescription('ID do warn').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('limpar').setDescription('Limpar todos os warnings de um usuário')
      .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const user = interaction.options.getUser('usuario');
  const lista = getWarns(user.id);

  if (sub === 'ver') {
    if (lista.length === 0) {
      return interaction.reply({ content: `✅ **${user.tag}** não tem warnings.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`⚠️ Warnings de ${user.tag}`)
      .setDescription(lista.map((w, i) =>
        `**${i + 1}.** ${w.motivo}\n> Autor: <@${w.autorId}> | Data: ${new Date(w.data).toLocaleString('pt-BR')}\n> ID: \`${w.id}\``
      ).join('\n\n'))
      .setFooter({ text: `Total: ${lista.length}` });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (sub === 'remover') {
    const id = interaction.options.getString('id');
    const ok = removeWarn(user.id, id);
    return interaction.reply({ content: ok ? `✅ Warn \`${id}\` removido.` : '❌ Warn não encontrado.', ephemeral: true });
  }

  if (sub === 'limpar') {
    const qtd = clearWarns(user.id);
    return interaction.reply({ content: `✅ **${qtd}** warning(s) de **${user.tag}** removido(s).`, ephemeral: true });
  }
}
