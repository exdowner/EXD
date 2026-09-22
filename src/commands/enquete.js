import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('enquete')
  .setDescription('Cria uma enquete com múltiplas opções (separadas por vírgula)')
  .addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true))
  .addStringOption(o => o.setName('opcoes').setDescription('Opções separadas por vírgula').setRequired(true));

export async function execute(interaction) {
  const p = interaction.options.getString('pergunta');
  const ops = interaction.options.getString('opcoes').split(',').map(s => s.trim()).slice(0, 10);
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('📊 ' + p)
    .setDescription(ops.map((o, i) => `${emojis[i]} ${o}`).join('\n'));

  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
  for (let i = 0; i < ops.length; i++) await msg.react(emojis[i]);
}
