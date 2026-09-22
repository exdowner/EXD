import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Define o modo lento do canal')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption(opt =>
    opt.setName('segundos').setDescription('Segundos entre mensagens (0 desativa)').setRequired(true).setMinValue(0).setMaxValue(21600));

export async function execute(interaction) {
  const seg = interaction.options.getInteger('segundos');

  try {
    await interaction.channel.setRateLimitPerUser(seg);
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x3498db)
        .setDescription(seg === 0
          ? '✅ Slowmode **desativado**.'
          : `🐌 Slowmode definido em **${seg}s**.`)],
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
  }
}
