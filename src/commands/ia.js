import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ia')
  .setDescription('Pergunta algo pra IA')
  .addStringOption(opt =>
    opt.setName('pergunta')
      .setDescription('O que você quer perguntar?')
      .setRequired(true)
      .setMaxLength(1000));

export async function execute(interaction) {
  await interaction.deferReply();
  const pergunta = interaction.options.getString('pergunta');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'Você é um assistente útil que responde em português do Brasil de forma direta e amigável.' },
          { role: 'user', content: pergunta }
        ],
        max_tokens: 500,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || 'Erro na API do Groq');

    const resposta = data.choices[0].message.content;

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🤖 IA responde')
      .addFields(
        { name: '❓ Pergunta', value: pergunta },
        { name: '💬 Resposta', value: resposta.slice(0, 1024) }
      )
      .setFooter({ text: `Perguntado por ${interaction.user.username}` });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('Erro na IA:', err);
    await interaction.editReply(`❌ Erro: ${err.message}`);
  }
}
