import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('translate')
  .setDescription('Traduz um texto (usa API pública)')
  .addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true))
  .addStringOption(o => o.setName('para').setDescription('Idioma (ex: en, pt, es)').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const texto = interaction.options.getString('texto');
  const para = interaction.options.getString('para');
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=auto|${para}`);
    const d = await r.json();
    await interaction.editReply(`🌐 **Tradução:**\n${d.responseData.translatedText}`);
  } catch (e) {
    await interaction.editReply('❌ Erro ao traduzir.');
  }
}
