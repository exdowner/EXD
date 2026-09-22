import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const OPCOES = ['pedra', 'papel', 'tesoura'];
const vence = { pedra: 'tesoura', papel: 'pedra', tesoura: 'papel' };

export const data = new SlashCommandBuilder()
  .setName('ppt')
  .setDescription('Pedra, papel, tesoura')
  .addStringOption(o => o.setName('escolha').setDescription('Sua jogada').setRequired(true)
    .addChoices({ name: 'Pedra', value: 'pedra' }, { name: 'Papel', value: 'papel' }, { name: 'Tesoura', value: 'tesoura' }));

export async function execute(interaction) {
  const escolha = interaction.options.getString('escolha');
  const bot = OPCOES[Math.floor(Math.random() * 3)];
  let resultado;
  if (escolha === bot) resultado = '🤝 Empate!';
  else if (vence[escolha] === bot) resultado = '🎉 Você ganhou!';
  else resultado = '💀 Você perdeu!';

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x3498db).setDescription(`Você: **${escolha}**\nBot: **${bot}**\n\n${resultado}`)] });
}
