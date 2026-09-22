import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('roleinfo')
  .setDescription('Informações de um cargo')
  .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true));

export async function execute(interaction) {
  const role = interaction.options.getRole('cargo');
  const embed = new EmbedBuilder()
    .setColor(role.color || 0x5865f2)
    .setTitle(`🎭 ${role.name}`)
    .addFields(
      { name: '🆔 ID', value: role.id, inline: true },
      { name: '🎨 Cor', value: role.hexColor, inline: true },
      { name: '📌 Posição', value: `${role.position}`, inline: true },
      { name: '👥 Membros', value: `${role.members.size}`, inline: true },
      { name: '🔔 Mencionável', value: role.mentionable ? 'Sim' : 'Não', inline: true },
      { name: '📢 Mostrar separado', value: role.hoist ? 'Sim' : 'Não', inline: true },
    );
  await interaction.reply({ embeds: [embed] });
}
