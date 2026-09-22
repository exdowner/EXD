import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Expulsa um usuário do servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem vai ser expulso').setRequired(true))
  .addStringOption(opt =>
    opt.setName('motivo').setDescription('Motivo').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const motivo = interaction.options.getString('motivo') || 'Não informado';

  const membro = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!membro) return interaction.reply({ content: '❌ Usuário não tá no servidor.', ephemeral: true });

  if (!membro.kickable) {
    return interaction.reply({ content: '❌ Não consigo expulsar (cargo maior que o meu).', ephemeral: true });
  }

  try {
    await membro.send({
      embeds: [new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle(`👢 Você foi expulso de ${interaction.guild.name}`)
        .addFields(
          { name: 'Motivo', value: motivo },
          { name: 'Moderador', value: interaction.user.tag },
        )],
    }).catch(() => {});

    await membro.kick(`${motivo} | Por ${interaction.user.tag}`);

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0xffa500).setDescription(`👢 **${user.tag}** foi expulso.\n**Motivo:** ${motivo}`)],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
