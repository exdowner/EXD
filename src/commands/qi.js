import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('qi')
  .setDescription('Mede o QI de alguém')
  .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('usuario') || interaction.user;
  let hash = 0;
  for (const c of user.id + Date.now().toString().slice(0, -3)) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  const qi = 60 + (Math.abs(hash) % 141);
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x3498db).setDescription(`🧠 **${user.username}** tem **${qi}** de QI.`)] });
}
