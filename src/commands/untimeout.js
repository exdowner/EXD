import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('untimeout')
  .setDescription('Remove o castigo (timeout) de um usuário')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem libertar').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const membro = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!membro) return interaction.reply({ content: '❌ Usuário não tá no servidor.', ephemeral: true });

  try {
    await membro.timeout(null);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🔓 **${user.tag}** foi liberado do castigo.`)],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
