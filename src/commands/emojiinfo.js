import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('emojiinfo')
  .setDescription('Informações de um emoji')
  .addStringOption(o => o.setName('emoji').setDescription('O emoji').setRequired(true));

export async function execute(interaction) {
  const input = interaction.options.getString('emoji');
  const match = input.match(/<a?:(\w+):(\d+)>/);
  if (!match) return interaction.reply({ content: '❌ Não é um emoji customizado.', ephemeral: true });

  const [, nome, id] = match;
  const animado = input.startsWith('<a:');
  const url = `https://cdn.discordapp.com/emojis/${id}.${animado ? 'gif' : 'png'}`;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`😀 ${nome}`)
    .setThumbnail(url)
    .addFields(
      { name: '🆔 ID', value: id, inline: true },
      { name: '🎬 Animado', value: animado ? 'Sim' : 'Não', inline: true },
    );
  await interaction.reply({ embeds: [embed] });
}
