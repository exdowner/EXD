import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Apaga mensagens do canal')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption(opt =>
    opt.setName('quantidade').setDescription('Quantas mensagens apagar (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Só apagar mensagens desse usuário').setRequired(false));

export async function execute(interaction) {
  const qtd = interaction.options.getInteger('quantidade');
  const user = interaction.options.getUser('usuario');

  await interaction.deferReply({ ephemeral: true });

  try {
    const mensagens = await interaction.channel.messages.fetch({ limit: 100 });
    let filtradas = [...mensagens.values()];

    if (user) filtradas = filtradas.filter(m => m.author.id === user.id);
    filtradas = filtradas.slice(0, qtd);

    const deletadas = await interaction.channel.bulkDelete(filtradas, true);

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0x2ecc71)
        .setDescription(`✅ **${deletadas.size}** mensagem(ns) apagada(s)${user ? ` de **${user.tag}**` : ''}.`)],
    });
  } catch (err) {
    await interaction.editReply({ content: `❌ Erro: ${err.message}` });
  }
}
