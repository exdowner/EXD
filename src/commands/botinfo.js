import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('botinfo')
  .setDescription('Informações do bot');

export async function execute(interaction) {
  const client = interaction.client;
  const uptime = process.uptime();
  const dias = Math.floor(uptime / 86400);
  const horas = Math.floor((uptime % 86400) / 3600);
  const minutos = Math.floor((uptime % 3600) / 60);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🤖 ${client.user.tag}`)
    .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '👥 Servidores', value: `${client.guilds.cache.size}`, inline: true },
      { name: '👤 Usuários', value: `${client.users.cache.size}`, inline: true },
      { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
      { name: '⏰ Uptime', value: `${dias}d ${horas}h ${minutos}m`, inline: true },
      { name: '📚 Discord.js', value: `v${djsVersion}`, inline: true },
      { name: '💻 Node.js', value: process.version, inline: true },
    );

  await interaction.reply({ embeds: [embed] });
}
