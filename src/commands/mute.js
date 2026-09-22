import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Silencia um usuário em todos os canais')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(opt =>
    opt.setName('usuario').setDescription('Quem silenciar').setRequired(true))
  .addStringOption(opt =>
    opt.setName('motivo').setDescription('Motivo').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario');
  const motivo = interaction.options.getString('motivo') || 'Não informado';

  const membro = await interaction.guild.members.fetch(user.id).catch(() => null);
  if (!membro) return interaction.reply({ content: '❌ Usuário não tá no servidor.', ephemeral: true });

  try {
    // Aplica mute em todos os canais de texto
    const canais = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
    for (const [, canal] of canais) {
      await canal.permissionOverwrites.edit(membro.id, {
        SendMessages: false,
        AddReactions: false,
        Speak: false,
      }).catch(() => {});
    }

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x95a5a6)
        .setDescription(`🔇 **${user.tag}** foi silenciado em todos os canais.\n**Motivo:** ${motivo}`)],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
