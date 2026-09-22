import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Cria uma enquete simples')
  .addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true));

export async function execute(interaction) {
  const p = interaction.options.getString('pergunta');
  const embed = new EmbedBuilder().setColor(0x3498db).setTitle('📊 Enquete').setDescription(p);
  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
  await msg.react('👍');
  await msg.react('👎');
}
