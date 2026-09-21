import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('cargoedit')
  .setDescription('Seleciona quais cargos vão aparecer no menu público')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  const cargos = interaction.guild.roles.cache
    .filter(r => r.name !== '@everyone' && !r.managed && r.position < interaction.guild.members.me.roles.highest.position)
    .sort((a, b) => b.position - a.position)
    .first(25);

  if (cargos.length === 0) {
    return interaction.reply({ content: '❌ Nenhum cargo disponível.', ephemeral: true });
  }

  const options = cargos.map(c => ({
    label: c.name.slice(0, 100),
    value: c.id,
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('cargoedit_menu')
    .setPlaceholder('Selecione os cargos que vão aparecer no /menucargo')
    .setMinValues(1)
    .setMaxValues(options.length)
    .addOptions(options);

  const row = new ActionRowBuilder().addComponents(menu);

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('⚙️ Configurar menu de cargos')
    .setDescription('Selecione abaixo quais cargos vão aparecer no `/menucargo`.');

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}
