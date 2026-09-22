import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('banner')
  .setDescription('Mostra o banner de um usuário')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const fetched = await user.fetch(true);
  const banner = fetched.bannerURL({ size: 1024, dynamic: true });

  if (!banner) {
    return interaction.reply({ content: `❌ **${user.tag}** não tem banner.`, ephemeral: true });
  }

  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`🖼️ Banner de ${user.tag}`).setImage(banner);
  await interaction.reply({ embeds: [embed] });
}
