import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getProdutos } from '../utils/loja.js';

export const data = new SlashCommandBuilder()
  .setName('lojaedit')
  .setDescription('Painel de edição dos produtos da loja')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const produtos = getProdutos();

  const lista = produtos.length > 0
    ? produtos.map(p => `${p.emoji} **${p.nome}** — R$ ${p.preco.toFixed(2)}`).join('\n')
    : '_Nenhum produto cadastrado._';

  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('⚙️ Editor da Loja')
    .setDescription(`**Produtos atuais:**\n${lista}\n\nUse os botões abaixo pra gerenciar.`);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('lojaedit_add').setLabel('Adicionar').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('lojaedit_edit').setLabel('Editar').setEmoji('✏️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('lojaedit_remove').setLabel('Excluir').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
  );

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}
