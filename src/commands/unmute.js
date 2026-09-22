import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Remove o mute de um usuário')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem desmutar').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const membro = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!membro) return interaction.reply({ content: '❌ Usuário não tá no servidor.', ephemeral: true });

  try {
    const canais = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
    for (const [, canal] of canais) {
      await canal.permissionOverwrites.edit(membro.id, {
        SendMessages: null,
        AddReactions: null,
        Speak: null,
      }).catch(() => {});
    }

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor(0x2ecc71).setDescription(`🔊 **${user.tag}** foi desmutado.`)],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
