import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Calcula a compatibilidade entre 2 usuários')
  .addUserOption(o => o.setName('usuario1').setDescription('Primeiro').setRequired(true))
  .addUserOption(o => o.setName('usuario2').setDescription('Segundo').setRequired(true));

export async function execute(interaction) {
  const a = interaction.options.getUser('usuario1');
  const b = interaction.options.getUser('usuario2');
  const id = [a.id, b.id].sort().join('');
  let hash = 0;
  for (const c of id) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  const pct = Math.abs(hash) % 101;
  const barra = '❤️'.repeat(Math.floor(pct / 10)) + '🖤'.repeat(10 - Math.floor(pct / 10));

  const embed = new EmbedBuilder()
    .setColor(0xff69b4)
    .setTitle('💕 Ship')
    .setDescription(`${a} 💞 ${b}\n\n${barra}\n**${pct}%** de compatibilidade`);
  await interaction.reply({ embeds: [embed] });
}
