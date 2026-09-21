import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('criarevento')
  .setDescription('Cria um evento com botão de participar')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
  .addStringOption(opt =>
    opt.setName('titulo').setDescription('Título do evento').setRequired(true))
  .addStringOption(opt =>
    opt.setName('descricao').setDescription('Descrição do evento').setRequired(true))
  .addIntegerOption(opt =>
    opt.setName('pontos').setDescription('Pontos que cada participante ganha').setMinValue(0).setRequired(false))
  .addStringOption(opt =>
    opt.setName('data').setDescription('Data/hora (ex: 25/12 às 20h)').setRequired(false));

export async function execute(interaction) {
  const titulo = interaction.options.getString('titulo');
  const descricao = interaction.options.getString('descricao');
  const pontos = interaction.options.getInteger('pontos') || 0;
  const data = interaction.options.getString('data') || 'A definir';

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle(`🎉 ${titulo}`)
    .setDescription(descricao)
    .addFields(
      { name: '📅 Data', value: data, inline: true },
      { name: '🏆 Pontos por participante', value: `${pontos}`, inline: true }
    )
    .setFooter({ text: `Evento criado por ${interaction.user.username}` })
    .setTimestamp();

  const botaoParticipar = new ButtonBuilder()
    .setCustomId('evento_participar')
    .setLabel('Participar')
    .setEmoji('✅')
    .setStyle(ButtonStyle.Success);

  const botaoSair = new ButtonBuilder()
    .setCustomId('evento_sair')
    .setLabel('Sair')
    .setEmoji('❌')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(botaoParticipar, botaoSair);

  const msg = await interaction.reply({
    embeds: [embed],
    components: [row],
    fetchReply: true,
  });

  // Avisa o index.js que esse evento foi criado (e com quantos pontos)
  interaction.client.emit('eventoCriado', msg.id, pontos);
}
