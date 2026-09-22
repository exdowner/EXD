import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('tts')
  .setDescription('Converte um texto em áudio (TTS grátis)')
  .addStringOption(o =>
    o.setName('texto').setDescription('O que falar').setRequired(true).setMaxLength(500))
  .addStringOption(o =>
    o.setName('idioma').setDescription('Idioma (padrão: pt-BR)').setRequired(false)
      .addChoices(
        { name: 'Português BR', value: 'pt-BR' },
        { name: 'Inglês', value: 'en' },
        { name: 'Espanhol', value: 'es' },
      ));

export async function execute(interaction) {
  await interaction.deferReply();
  const texto = interaction.options.getString('texto');
  const idioma = interaction.options.getString('idioma') || 'pt-BR';

  try {
    // Usa Google Translate TTS (grátis, sem API key)
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto.slice(0, 200))}&tl=${idioma}&client=tw-ob`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) throw new Error('Falha ao gerar áudio');

    const buffer = Buffer.from(await res.arrayBuffer());
    const attachment = new AttachmentBuilder(buffer, { name: 'tts.mp3' });

    await interaction.editReply({ files: [attachment] });
  } catch (err) {
    console.error('Erro no TTS:', err);
    await interaction.editReply(`❌ Erro ao gerar áudio: ${err.message}`);
  }
}
