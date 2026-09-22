import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lembrete')
  .setDescription('Cria um lembrete')
  .addIntegerOption(o => o.setName('minutos').setDescription('Em quantos minutos').setRequired(true).setMinValue(1))
  .addStringOption(o => o.setName('texto').setDescription('O que lembrar').setRequired(true));

export async function execute(interaction) {
  const min = interaction.options.getInteger('minutos');
  const texto = interaction.options.getString('texto');
  await interaction.reply({ content: `⏰ Vou te lembrar em **${min} minuto(s)**.`, ephemeral: true });
  setTimeout(async () => {
    try { await interaction.user.send(`⏰ **Lembrete:** ${texto}`); } catch {}
  }, min * 60 * 1000);
}
