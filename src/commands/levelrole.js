import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { setLevelRole, getLevelRoles } from '../utils/levels.js';

export const data = new SlashCommandBuilder()
  .setName('levelrole')
  .setDescription('Define qual cargo o usuário ganha em tal nível (admin)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('set').setDescription('Definir cargo pra um nível')
      .addIntegerOption(o => o.setName('nivel').setDescription('Nível').setRequired(true).setMinValue(1))
      .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('listar').setDescription('Listar cargos por nível'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  if (sub === 'set') {
    const nivel = interaction.options.getInteger('nivel');
    const cargo = interaction.options.getRole('cargo');
    setLevelRole(nivel, cargo.id);
    return interaction.reply({ content: `✅ Nível **${nivel}** → cargo <@&${cargo.id}>.`, ephemeral: true });
  }
  const lista = getLevelRoles();
  if (lista.length === 0) return interaction.reply({ content: '❌ Nada configurado.', ephemeral: true });
  const embed = new EmbedBuilder().setColor(0x9b59b6).setTitle('🎭 Cargos por Nível')
    .setDescription(lista.map(([n, r]) => `**Nível ${n}** → <@&${r}>`).join('\n'));
  await interaction.reply({ embeds: [embed] });
}
