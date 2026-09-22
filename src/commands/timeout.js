import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Coloca um usuário de castigo (timeout)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem castigar').setRequired(true))
  .addIntegerOption(opt =>
    opt.setName('minutos').setDescription('Duração em minutos').setRequired(true).setMinValue(1).setMaxValue(40320))
  .addStringOption(opt =>
    opt.setName('motivo').setDescription('Motivo').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const minutos = interaction.options.getInteger('minutos');
  const motivo = interaction.options.getString('motivo') || 'Não informado';

  const membro = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!membro) return interaction.reply({ content: '❌ Usuário não tá no servidor.', ephemeral: true });

  if (!membro.moderatable) {
    return interaction.reply({ content: '❌ Não posso castigar esse usuário.', ephemeral: true });
  }

  try {
    await membro.timeout(minutos * 60 * 1000, `${motivo} | Por ${interaction.user.tag}`);

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xe67e22)
        .setDescription(`⏰ **${user.tag}** foi castigado por **${minutos} minuto(s)**.\n**Motivo:** ${motivo}`)],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
