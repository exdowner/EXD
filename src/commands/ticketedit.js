import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getTipos } from '../utils/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('ticketedit')
  .setDescription('Abre o painel de edição dos tipos de ticket')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const tipos = getTipos();

  const listaTipos = tipos.length > 0
    ? tipos.map(t => `${t.emoji} **${t.nome}** ${t.foto ? '🖼️' : '(sem foto)'}`).join('\n')
    : '_Nenhum tipo cadastrado ainda._';

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('⚙️ Editor de Tickets')
    .setDescription(
      `**Tipos atuais:**\n${listaTipos}\n\n` +
      `Use os botões abaixo pra gerenciar.`
    );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticketedit_add')
      .setLabel('Adicionar Tipo')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('ticketedit_remove')
      .setLabel('Remover Tipo')
      .setEmoji('➖')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('ticketedit_foto')
      .setLabel('Adicionar Foto')
      .setEmoji('🖼️')
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.reply({ embeds: [embed], components: [row1], ephemeral: true });
}
