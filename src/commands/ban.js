import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bane um usuário do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem vai ser banido').setRequired(true))
  .addStringOption(opt =>
    opt.setName('motivo').setDescription('Motivo do ban').setRequired(false))
  .addIntegerOption(opt =>
    opt.setName('dias').setDescription('Dias de mensagens pra deletar (0-7)').setMinValue(0).setMaxValue(7).setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const motivo = interaction.options.getString('motivo') || 'Não informado';
  const dias = interaction.options.getInteger('dias') || 0;

  const membro = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!membro) return interaction.reply({ content: '❌ Usuário não tá no servidor.', ephemeral: true });

  if (!membro.bannable) {
    return interaction.reply({ content: '❌ Não consigo banir esse usuário (cargo maior que o meu).', ephemeral: true });
  }

  try {
    await membro.send({
      embeds: [new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`🔨 Você foi banido de ${interaction.guild.name}`)
        .addFields(
          { name: 'Motivo', value: motivo },
          { name: 'Moderador', value: interaction.user.tag },
        )],
    }).catch(() => {});

    await membro.ban({ reason: `${motivo} | Por ${interaction.user.tag}`, deleteMessageSeconds: dias * 86400 });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setDescription(`🔨 **${user.tag}** foi banido.\n**Motivo:** ${motivo}`);

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
