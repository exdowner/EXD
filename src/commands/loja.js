import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getProdutos } from '../utils/loja.js';

export const data = new SlashCommandBuilder()
  .setName('loja')
  .setDescription('Envia o painel da loja neste canal');

export async function execute(interaction) {
  const produtos = getProdutos();

  if (produtos.length === 0) {
    return interaction.reply({ content: '❌ Nenhum produto cadastrado. Use `/lojaedit` primeiro.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🛒 Loja')
    .setDescription(
      'Escolha um produto no menu abaixo pra comprar.\n\n' +
      produtos.map(p => `${p.emoji} **${p.nome}** — R$ ${p.preco.toFixed(2)}\n> ${p.descricao}`).join('\n\n')
    )
    .setFooter({ text: 'Ao escolher, você vai receber a chave Pix e as instruções.' });

  const menu = new StringSelectMenuBuilder()
    .setCustomId('loja_produto_menu')
    .setPlaceholder('Escolha um produto')
    .addOptions(produtos.slice(0, 25).map(p => ({
      label: p.nome.slice(0, 100),
      description: `R$ ${p.preco.toFixed(2)}`,
      value: p.id,
      emoji: p.emoji,
    })));

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.reply({ embeds: [embed], components: [row] });
}
