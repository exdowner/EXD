import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('sorteio')
  .setDescription('Cria um sorteio rápido')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption(o => o.setName('premio').setDescription('Prêmio').setRequired(true))
  .addIntegerOption(o => o.setName('segundos').setDescription('Duração em segundos').setRequired(true).setMinValue(10));

export async function execute(interaction) {
  const premio = interaction.options.getString('premio');
  const seg = interaction.options.getInteger('segundos');

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle('🎉 Sorteio!')
    .setDescription(`**Prêmio:** ${premio}\n**Duração:** ${seg}s\n\nReaja com 🎉 pra participar!`);

  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
  await msg.react('🎉');

  setTimeout(async () => {
    const fetched = await msg.fetch();
    const reacao = fetched.reactions.cache.get('🎉');
    if (!reacao) return interaction.followUp('❌ Ninguém participou.');
    const users = await reacao.users.fetch();
    const participantes = users.filter(u => !u.bot);
    if (participantes.size === 0) return interaction.followUp('❌ Ninguém participou.');
    const ganhador = participantes.random();
    await interaction.followUp(`🎉 O ganhador foi **${ganhador}**! Parabéns!`);
  }, seg * 1000);
}
