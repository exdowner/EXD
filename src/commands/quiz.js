import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const PERGUNTAS = [
  { p: 'Qual a capital do Brasil?', r: 'Brasília' },
  { p: 'Quanto é 7 x 8?', r: '56' },
  { p: 'Qual o maior planeta do sistema solar?', r: 'Júpiter' },
  { p: 'Em que ano o homem pisou na Lua?', r: '1969' },
];

export const data = new SlashCommandBuilder()
  .setName('quiz')
  .setDescription('Pergunta de quiz aleatória');

export async function execute(interaction) {
  const q = PERGUNTAS[Math.floor(Math.random() * PERGUNTAS.length)];
  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🧠 Quiz')
    .addFields({ name: 'Pergunta', value: q.p })
    .setFooter({ text: `Resposta: ${q.r[0]}${'_'.repeat(q.r.length - 1)}` });
  await interaction.reply({ embeds: [embed] });
}
