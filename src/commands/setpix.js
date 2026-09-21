import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { setPix, getPix } from '../utils/loja.js';

export const data = new SlashCommandBuilder()
  .setName('setpix')
  .setDescription('Define a chave Pix da loja')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption(opt =>
    opt.setName('tipo')
      .setDescription('Tipo da chave Pix')
      .setRequired(true)
      .addChoices(
        { name: 'CPF', value: 'CPF' },
        { name: 'CNPJ', value: 'CNPJ' },
        { name: 'E-mail', value: 'E-mail' },
        { name: 'Telefone', value: 'Telefone' },
        { name: 'Chave Aleatória', value: 'Chave Aleatória' },
      ))
  .addStringOption(opt =>
    opt.setName('chave')
      .setDescription('A chave Pix em si')
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('nome')
      .setDescription('Nome do recebedor')
      .setRequired(true));

export async function execute(interaction) {
  const tipo = interaction.options.getString('tipo');
  const chave = interaction.options.getString('chave');
  const nome = interaction.options.getString('nome');

  setPix(tipo, chave, nome);

  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('✅ Pix configurado')
    .addFields(
      { name: 'Tipo', value: tipo, inline: true },
      { name: 'Chave', value: `\`${chave}\``, inline: true },
      { name: 'Nome', value: nome, inline: true },
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
