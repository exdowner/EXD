import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { setPainelMessageId, getTipos } from '../utils/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('set')
  .setDescription('Envia o painel de abertura de tickets neste canal')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const tipos = getTipos();

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎫 Central de Atendimento')
    .setDescription(
      'Precisa de ajuda? Clique no botão abaixo pra abrir um ticket.\n\n' +
      (tipos.length > 0
        ? `**Tipos disponíveis:**\n${tipos.map(t => `${t.emoji} ${t.nome}`).join('\n')}`
        : '⚠️ Nenhum tipo configurado ainda. Use `/ticketedit` primeiro.')
    )
    .setFooter({ text: 'Nossa equipe vai te atender o mais rápido possível' });

  const botao = new ButtonBuilder()
    .setCustomId('ticket_abrir')
    .setLabel('Abrir Ticket')
    .setEmoji('🎫')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(botao);

  const msg = await interaction.reply({
    embeds: [embed],
    components: [row],
    fetchReply: true,
  });

  setPainelMessageId(msg.id);
}
