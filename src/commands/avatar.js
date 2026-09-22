import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription('Mostra o avatar de um usuário')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🖼️ Avatar de ${user.tag}`)
    .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }));
  await interaction.reply({ embeds: [embed] });
}
