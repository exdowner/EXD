import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addWarn } from '../utils/moderacao.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Dá um aviso a um usuário')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem avisar').setRequired(true))
  .addStringOption(opt =>
    opt.setName('motivo').setDescription('Motivo do aviso').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const motivo = interaction.options.getString('motivo');

  const warn = addWarn(user.id, motivo, interaction.user.id);

  try {
    await user.send({
      embeds: [new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle(`⚠️ Você recebeu um aviso em ${interaction.guild.name}`)
        .addFields(
          { name: 'Motivo', value: motivo },
          { name: 'Moderador', value: interaction.user.tag },
        )],
    }).catch(() => {});
  } catch {}

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor(0xf1c40f)
      .setDescription(`⚠️ **${user.tag}** recebeu um aviso.\n**Motivo:** ${motivo}\n**ID do warn:** \`${warn.id}\``)],
  });
}
