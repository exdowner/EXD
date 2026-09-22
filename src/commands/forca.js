import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const PALAVRAS = ['discord', 'javascript', 'programacao', 'computador', 'internet', 'bot'];

export const data = new SlashCommandBuilder()
  .setName('forca')
  .setDescription('Jogo da forca — adivinhe a palavra');

export async function execute(interaction) {
  const palavra = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
  const dica = palavra.split('').map(() => '⬜').join(' ');
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x9b59b6).setTitle('🎯 Forca').setDescription(`Palavra: \`${dica}\`\nDica: **${palavra.length}** letras\n\nResponda no chat!`)] });
}
