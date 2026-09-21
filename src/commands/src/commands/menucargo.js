import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { getCargosMenu } from '../utils/cargosMenu.js';

export const data = new SlashCommandBuilder()
  .setName('menucargo')
  .setDescription('Envia o menu público de cargos');

export async function execute(interaction) {
  const cargosIds = getCargosMenu();

  if (cargosIds.length === 0) {
    return interaction.reply({ content: '❌ Nenhum cargo configurado. Use `/cargoedit` primeiro.', ephemeral: true });
  }

  const cargos = cargosIds
    .map(id => interaction.guild.roles.cache.get(id))
    .filter(Boolean);

  if (cargos.length === 0) {
    return interaction.reply({ content: '❌ Os cargos configurados não existem mais.', ephemeral: true });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('menu_cargos')
    .setPlaceholder('Escolha seus cargos')
    .setMinValues(0)
    .setMaxValues(cargos.length)
    .addOptions(cargos.map(c => ({
      label: c.name.slice(0, 100),
      value: c.id,
    })));

  const row = new ActionRowBuilder().addComponents(menu);

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎭 Menu de Cargos')
    .setDescription('Clique no menu abaixo para escolher seus cargos.\nSelecionar de novo um cargo que você já tem **remove** ele.')
    .setFooter({ text: 'Você pode escolher vários cargos ao mesmo tempo' });

  await interaction.reply({ embeds: [embed], components: [row] });
}
