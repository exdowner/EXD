import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { expand } from 'url-unshortener';

export const data = new SlashCommandBuilder()
  .setName('unshort')
  .setDescription('Expande um link encurtado (bit.ly, tinyurl, etc)')
  .addStringOption(o =>
    o.setName('url').setDescription('Link encurtado').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const url = interaction.options.getString('url');

  try {
    const resultado = await expand(url, {
      timeout: 15000,
      maxRedirects: 15,
    });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔗 Link Expandido')
      .addFields(
        { name: 'Original', value: resultado.originalUrl.slice(0, 1024) },
        { name: 'Destino Final', value: resultado.expandedUrl.slice(0, 1024) },
        { name: 'Status HTTP', value: `${resultado.statusCode}`, inline: true },
        { name: 'Redirecionamentos', value: `${resultado.redirectChain.length}`, inline: true },
      );

    if (resultado.redirectChain.length > 0) {
      const chain = resultado.redirectChain.slice(0, 5).map((u, i) => `${i + 1}. ${u}`).join('\n');
      embed.addFields({ name: 'Cadeia de Redirects', value: chain.slice(0, 1024) });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('Erro no unshort:', err.message);
    await interaction.editReply(`❌ Erro ao expandir: ${err.message}`);
  }
}
