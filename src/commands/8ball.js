import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const RESPOSTAS = [
  'Com certeza!', 'Sem dúvida.', 'Sim!', 'Provavelmente.', 'Talvez...',
  'Não sei.', 'Não conte com isso.', 'Não.', 'De jeito nenhum.', 'Pergunta de novo.',
];

export const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Pergunta pra bola mágica 🎱')
  .addStringOption(o => o.setName('pergunta').setDescription('A pergunta').setRequired(true));

export async function execute(interaction) {
  const p = interaction.options.getString('pergunta');
  const r = RESPOSTAS[Math.floor(Math.random() * RESPOSTAS.length)];
  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🎱 Bola Mágica')
    .addFields({ name: '❓ Pergunta', value: p }, { name: '💬 Resposta', value: r });
  await interaction.reply({ embeds: [embed] });
}
