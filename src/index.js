import 'dotenv/config';
import {
  Client, GatewayIntentBits, Collection, REST, Routes,
  ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, ChannelType, PermissionFlagsBits,
  ModalBuilder, TextInputBuilder, TextInputStyle,
} from 'discord.js';
import express from 'express';
import { loadCommands } from './handlers/commandHandler.js';
import { setCargosMenu, getCargosMenu } from './utils/cargosMenu.js';
import { addPontos } from './utils/banco.js';
import {
  getLogsChannel, getTipos, addTipo, removeTipo, setFotoTipo,
  ticketsAbertos,
} from './utils/tickets.js';
import {
  getPix, getLogsCompras, addProduto, removeProduto, updateProduto,
  getProduto, getProdutos,
} from './utils/loja.js';
import { addXp, getXp, getLevelRole } from './utils/levels.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();

const eventosParticipantes = new Map();
const eventosPontos = new Map();
const esperandoFoto = new Map();
const comprasPendentes = new Map();
const xpCooldown = new Map();

client.on('eventoCriado', (messageId, pontos) => {
  eventosPontos.set(messageId, pontos);
});

client.on('interactionCreate', async (interaction) => {

  // ========== Slash commands ==========
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro no comando ${interaction.commandName}:`, error);
      const msg = { content: '❌ Deu erro ao executar esse comando.', ephemeral: true };
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    }
    return;
  }

  // ========== Select: /cargoedit ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'cargoedit_menu') {
    setCargosMenu(interaction.values);
    await interaction.update({
      content: `✅ **${interaction.values.length}** cargo(s) configurado(s)!`,
      embeds: [], components: [],
    });
    return;
  }

  // ========== Select: /menucargo ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'menu_cargos') {
    const selecionados = interaction.values;
    const todos = getCargosMenu();
    let add = 0, rem = 0;
    for (const id of todos) {
      const tem = interaction.member.roles.cache.has(id);
      const sel = selecionados.includes(id);
      try {
        if (sel && !tem) { await interaction.member.roles.add(id); add++; }
        else if (!sel && tem) { await interaction.member.roles.remove(id); rem++; }
      } catch (err) { console.error(err.message); }
    }
    await interaction.reply({
      content: `✅ Cargos atualizados!\n➕ Adicionados: **${add}**\n➖ Removidos: **${rem}**`,
      ephemeral: true,
    });
    return;
  }

  // ========== Select: ticketedit remove ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticketedit_remove_menu') {
    let r = 0;
    for (const id of interaction.values) if (removeTipo(id)) r++;
    await interaction.update({ content: `✅ **${r}** tipo(s) removido(s).`, embeds: [], components: [] });
    return;
  }

  // ========== Select: ticketedit foto ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticketedit_foto_menu') {
    esperandoFoto.set(interaction.user.id, interaction.values[0]);
    await interaction.update({ content: '📸 Manda a foto aqui no canal.', embeds: [], components: [] });
    return;
  }

  // ========== Select: tipo de ticket (ABRE O TICKET COM FOTO) ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_tipo_menu') {
    const tipo = getTipos().find(t => t.id === interaction.values[0]);
    if (!tipo) return interaction.reply({ content: '❌ Tipo não encontrado.', ephemeral: true });

    const guild = interaction.guild;
    const nomeCanal = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);

    try {
      const canal = await guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      ticketsAbertos.set(canal.id, { autorId: interaction.user.id, tipoId: tipo.id, reivindicadoPor: null });

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${tipo.emoji} Ticket: ${tipo.nome}`)
        .setDescription(`Olá <@${interaction.user.id}>! Um membro da equipe vai te atender.`)
        .setTimestamp();

      if (tipo.foto) embed.setImage(tipo.foto);

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_reivindicar').setLabel('Reivindicar').setEmoji('✋').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_fechar').setLabel('Fechar').setEmoji('🔒').setStyle(ButtonStyle.Danger),
      );

      await canal.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [botoes] });

      const logsId = getLogsChannel();
      if (logsId) {
        const lc = guild.channels.cache.get(logsId);
        if (lc) await lc.send({ embeds: [new EmbedBuilder().setColor(0x3498db).setTitle('📩 Novo Ticket').addFields(
          { name: 'Autor', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Tipo', value: `${tipo.emoji} ${tipo.nome}`, inline: true },
          { name: 'Canal', value: `<#${canal.id}>`, inline: true },
        ).setTimestamp()] });
      }

      await interaction.reply({ content: `✅ Ticket criado: <#${canal.id}>`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `❌ Erro: ${err.message}`, ephemeral: true });
    }
    return;
  }

  // ========== Select: loja produto (PAGAMENTO COM FOTO) ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'loja_produto_menu') {
    const produto = getProduto(interaction.values[0]);
    if (!produto) return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });

    const pix = getPix();
    if (!pix.chave) {
      return interaction.reply({ content: '❌ A loja não configurou o Pix ainda. Avise um admin.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`💳 Pagamento: ${produto.emoji} ${produto.nome}`)
      .setDescription(
        `**Valor:** R$ ${produto.preco.toFixed(2)}\n\n` +
        `**Pague via Pix:**\n` +
        `> Tipo: **${pix.tipo}**\n` +
        `> Chave: \`${pix.chave}\`\n` +
        `> Nome: **${pix.nome}**\n\n` +
        `Depois de pagar, clique em **Enviar Comprovante** abaixo.`
      );

    if (produto.foto) embed.setImage(produto.foto);

    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`loja_comprovante_${produto.id}`).setLabel('Enviar Comprovante').setEmoji('📎').setStyle(ButtonStyle.Success),
    );

    await interaction.reply({ embeds: [embed], components: [botao], ephemeral: true });
    return;
  }

  // ========== Select: lojaedit editar produto (COM FOTO) ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'lojaedit_edit_menu') {
    const produto = getProduto(interaction.values[0]);
    if (!produto) return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });

    const modal = new ModalBuilder()
      .setCustomId(`lojaedit_edit_modal_${produto.id}`)
      .setTitle('Editar Produto')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome').setStyle(TextInputStyle.Short).setValue(produto.nome).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('descricao').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setValue(produto.descricao).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('Preço (ex: 19.90)').setStyle(TextInputStyle.Short).setValue(produto.preco.toString()).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('entrega').setLabel('Entrega (link/código)').setStyle(TextInputStyle.Paragraph).setValue(produto.entrega).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('foto').setLabel('URL da Foto (opcional)').setStyle(TextInputStyle.Short).setValue(produto.foto || '').setRequired(false)),
      );
    await interaction.showModal(modal);
    return;
  }

  // ========== Select: lojaedit remover ==========
  if (interaction.isStringSelectMenu() && interaction.customId === 'lojaedit_remove_menu') {
    let r = 0;
    for (const id of interaction.values) if (removeProduto(id)) r++;
    await interaction.update({ content: `✅ **${r}** produto(s) removido(s).`, embeds: [], components: [] });
    return;
  }

  // ========== Botões ==========
  if (interaction.isButton()) {
    const userId = interaction.user.id;
    const msgId = interaction.message.id;

    // --- Evento: participar ---
    if (interaction.customId.startsWith('evento_participar')) {
      if (!eventosParticipantes.has(msgId)) eventosParticipantes.set(msgId, new Set());
      const p = eventosParticipantes.get(msgId);
      if (p.has(userId)) return interaction.reply({ content: '⚠️ Já tá participando!', ephemeral: true });
      p.add(userId);
      const pts = eventosPontos.get(msgId) || 0;
      if (pts > 0) addPontos(userId, pts);
      return interaction.reply({ content: `✅ Entrou! Total: **${p.size}**${pts > 0 ? ` (+${pts} pts)` : ''}`, ephemeral: true });
    }

    // --- Evento: sair ---
    if (interaction.customId.startsWith('evento_sair')) {
      if (!eventosParticipantes.has(msgId)) eventosParticipantes.set(msgId, new Set());
      const p = eventosParticipantes.get(msgId);
      if (!p.has(userId)) return interaction.reply({ content: '⚠️ Não tá participando.', ephemeral: true });
      p.delete(userId);
      const pts = eventosPontos.get(msgId) || 0;
      if (pts > 0) addPontos(userId, -pts);
      return interaction.reply({ content: `❌ Saiu. Total: **${p.size}**`, ephemeral: true });
    }

    // --- Ticket: abrir ---
    if (interaction.customId === 'ticket_abrir') {
      const tipos = getTipos();
      if (tipos.length === 0) return interaction.reply({ content: '❌ Nenhum tipo configurado.', ephemeral: true });

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_tipo_menu')
        .setPlaceholder('Escolha o tipo')
        .addOptions(tipos.map(t => ({ label: t.nome.slice(0, 100), value: t.id, emoji: t.emoji })));

      return interaction.reply({
        content: '🎫 Escolha o tipo de ticket:',
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true,
      });
    }

    // --- Ticket: reivindicar ---
    if (interaction.customId === 'ticket_reivindicar') {
      const t = ticketsAbertos.get(interaction.channel.id);
      if (!t) return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: '❌ Só admins.', ephemeral: true });
      if (t.reivindicadoPor)
        return interaction.reply({ content: `⚠️ Já reivindicado por <@${t.reivindicadoPor}>.`, ephemeral: true });

      t.reivindicadoPor = userId;
      await interaction.channel.send({ embeds: [new EmbedBuilder().setColor(0xf1c40f).setDescription(`✋ **TICKET REIVINDICADO** por <@${userId}>`).setTimestamp()] });
      await interaction.reply({ content: '✅ Reivindicado.', ephemeral: true });

      const logsId = getLogsChannel();
      if (logsId) {
        const lc = interaction.guild.channels.cache.get(logsId);
        if (lc) await lc.send({ embeds: [new EmbedBuilder().setColor(0xf1c40f).setDescription(`✋ Ticket <#${interaction.channel.id}> reivindicado por <@${userId}>`)] });
      }
      return;
    }

    // --- Ticket: fechar ---
    if (interaction.customId === 'ticket_fechar') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: '❌ Só admins.', ephemeral: true });

      const logsId = getLogsChannel();
      if (logsId) {
        const lc = interaction.guild.channels.cache.get(logsId);
        if (lc) await lc.send({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription(`🔒 Ticket <#${interaction.channel.id}> fechado por <@${userId}>`)] });
      }

      await interaction.reply({ content: '🔒 Fechando em 5s...' });
      setTimeout(async () => {
        try { ticketsAbertos.delete(interaction.channel.id); await interaction.channel.delete(); }
        catch (err) { console.error(err); }
      }, 5000);
      return;
    }

    // --- Ticketedit: add ---
    if (interaction.customId === 'ticketedit_add') {
      const modal = new ModalBuilder()
        .setCustomId('ticketedit_add_modal')
        .setTitle('Adicionar Tipo de Ticket')
        .addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome do tipo').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(80)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji (opcional)').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(5)),
        );
      await interaction.showModal(modal);
      return;
    }

    // --- Ticketedit: remove ---
    if (interaction.customId === 'ticketedit_remove') {
      const tipos = getTipos();
      if (tipos.length === 0) return interaction.reply({ content: '❌ Nada pra remover.', ephemeral: true });
      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticketedit_remove_menu')
        .setPlaceholder('Selecione pra remover')
        .setMinValues(1).setMaxValues(tipos.length)
        .addOptions(tipos.map(t => ({ label: t.nome.slice(0, 100), value: t.id })));
      return interaction.reply({ content: '🗑️ Selecione:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
    }

    // --- Ticketedit: foto ---
    if (interaction.customId === 'ticketedit_foto') {
      const tipos = getTipos();
      if (tipos.length === 0) return interaction.reply({ content: '❌ Nada cadastrado.', ephemeral: true });
      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticketedit_foto_menu')
        .setPlaceholder('Escolha o tipo')
        .addOptions(tipos.map(t => ({ label: t.nome.slice(0, 100), value: t.id })));
      return interaction.reply({ content: '🖼️ Escolha:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
    }

    // --- Lojaedit: add (COM FOTO) ---
    if (interaction.customId === 'lojaedit_add') {
      const modal = new ModalBuilder()
        .setCustomId('lojaedit_add_modal')
        .setTitle('Adicionar Produto')
        .addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome do produto').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(100)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('descricao').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('Preço (ex: 19.90)').setStyle(TextInputStyle.Short).setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('entrega').setLabel('Entrega (link/código)').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji (opcional)').setStyle(TextInputStyle.Short).setRequired(false).setMaxLength(5)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('foto').setLabel('URL da Foto (opcional)').setStyle(TextInputStyle.Short).setRequired(false)),
        );
      await interaction.showModal(modal);
      return;
    }

    // --- Lojaedit: edit ---
    if (interaction.customId === 'lojaedit_edit') {
      const prods = getProdutos();
      if (prods.length === 0) return interaction.reply({ content: '❌ Nada cadastrado.', ephemeral: true });
      const menu = new StringSelectMenuBuilder()
        .setCustomId('lojaedit_edit_menu')
        .setPlaceholder('Escolha o produto')
        .addOptions(prods.slice(0, 25).map(p => ({ label: p.nome.slice(0, 100), value: p.id, emoji: p.emoji })));
      return interaction.reply({ content: '✏️ Escolha:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
    }

    // --- Lojaedit: remove ---
    if (interaction.customId === 'lojaedit_remove') {
      const prods = getProdutos();
      if (prods.length === 0) return interaction.reply({ content: '❌ Nada pra remover.', ephemeral: true });
      const menu = new StringSelectMenuBuilder()
        .setCustomId('lojaedit_remove_menu')
        .setPlaceholder('Selecione pra excluir')
        .setMinValues(1).setMaxValues(prods.length)
        .addOptions(prods.slice(0, 25).map(p => ({ label: p.nome.slice(0, 100), value: p.id, emoji: p.emoji })));
      return interaction.reply({ content: '🗑️ Selecione:', components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
    }

    // --- Loja: enviar comprovante (COM VERIFICAÇÃO) ---
    if (interaction.customId.startsWith('loja_comprovante_')) {
      const produtoId = interaction.customId.replace('loja_comprovante_', '');
      const produto = getProduto(produtoId);
      if (!produto) return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });

      const logsId = getLogsCompras();
      if (!logsId || !interaction.guild.channels.cache.get(logsId)) {
        return interaction.reply({ content: '❌ O canal de comprovantes não está configurado. Avise um administrador.', ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId(`loja_comprovante_modal_${produtoId}`)
        .setTitle('Enviar Comprovante')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('link')
              .setLabel('Link do comprovante (print no imgur etc)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setPlaceholder('https://...')
          ),
        );
      await interaction.showModal(modal);
      return;
    }

    // --- Compras: aceitar ---
    if (interaction.customId.startsWith('compra_aceitar_')) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: '❌ Só admins.', ephemeral: true });

      const dados = comprasPendentes.get(msgId);
      if (!dados) return interaction.reply({ content: '❌ Compra não encontrada.', ephemeral: true });

      const produto = getProduto(dados.produtoId);
      if (!produto) return interaction.reply({ content: '❌ Produto não existe mais.', ephemeral: true });

      try {
        const user = await client.users.fetch(dados.userId);
        await user.send({
          embeds: [new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle(`✅ Compra aprovada: ${produto.emoji} ${produto.nome}`)
            .setDescription(`Obrigado pela compra! Aqui está sua entrega:\n\n${produto.entrega}`)
          ],
        });
        await interaction.reply({ content: `✅ Aprovado! Entrega enviada na DM de <@${dados.userId}>.` });
      } catch (err) {
        await interaction.reply({ content: `⚠️ Aprovado, mas não consegui mandar DM pro cliente (${err.message}). Link de entrega:\n\n${produto.entrega}` });
      }

      comprasPendentes.delete(msgId);
      return;
    }

    // --- Compras: recusar ---
    if (interaction.customId.startsWith('compra_recusar_')) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ content: '❌ Só admins.', ephemeral: true });

      const dados = comprasPendentes.get(msgId);
      if (dados) {
        try {
          const user = await client.users.fetch(dados.userId);
          await user.send({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription('❌ Seu comprovante foi recusado. Entre em contato com a equipe.')] });
        } catch {}
        comprasPendentes.delete(msgId);
      }

      await interaction.reply({ content: '❌ Compra recusada.' });
      return;
    }
  }

  // ========== Modals ==========
  if (interaction.isModalSubmit()) {

    // Ticketedit: add tipo
    if (interaction.customId === 'ticketedit_add_modal') {
      const nome = interaction.fields.getTextInputValue('nome');
      const emoji = interaction.fields.getTextInputValue('emoji') || '🎫';
      addTipo(nome, emoji);
      return interaction.reply({ content: `✅ Tipo **${emoji} ${nome}** adicionado!`, ephemeral: true });
    }

    // Lojaedit: add produto (COM FOTO)
    if (interaction.customId === 'lojaedit_add_modal') {
      const nome = interaction.fields.getTextInputValue('nome');
      const descricao = interaction.fields.getTextInputValue('descricao');
      const preco = parseFloat(interaction.fields.getTextInputValue('preco').replace(',', '.'));
      const entrega = interaction.fields.getTextInputValue('entrega');
      const emoji = interaction.fields.getTextInputValue('emoji') || '🛒';
      const foto = interaction.fields.getTextInputValue('foto') || null;

      if (isNaN(preco)) return interaction.reply({ content: '❌ Preço inválido.', ephemeral: true });

      addProduto(nome, descricao, preco, entrega, emoji, foto);
      return interaction.reply({ content: `✅ Produto **${emoji} ${nome}** adicionado!`, ephemeral: true });
    }

    // Lojaedit: edit produto (COM FOTO)
    if (interaction.customId.startsWith('lojaedit_edit_modal_')) {
      const id = interaction.customId.replace('lojaedit_edit_modal_', '');
      const nome = interaction.fields.getTextInputValue('nome');
      const descricao = interaction.fields.getTextInputValue('descricao');
      const preco = parseFloat(interaction.fields.getTextInputValue('preco').replace(',', '.'));
      const entrega = interaction.fields.getTextInputValue('entrega');
      const foto = interaction.fields.getTextInputValue('foto') || null;

      if (isNaN(preco)) return interaction.reply({ content: '❌ Preço inválido.', ephemeral: true });

      updateProduto(id, 'nome', nome);
      updateProduto(id, 'descricao', descricao);
      updateProduto(id, 'preco', preco);
      updateProduto(id, 'entrega', entrega);
      updateProduto(id, 'foto', foto);

      return interaction.reply({ content: `✅ Produto atualizado!`, ephemeral: true });
    }

    // Loja: comprovante
    if (interaction.customId.startsWith('loja_comprovante_modal_')) {
      const produtoId = interaction.customId.replace('loja_comprovante_modal_', '');
      const link = interaction.fields.getTextInputValue('link');
      const produto = getProduto(produtoId);
      if (!produto) return interaction.reply({ content: '❌ Produto não existe mais.', ephemeral: true });

      const logsId = getLogsCompras();
      if (!logsId) return interaction.reply({ content: '❌ Loja não configurou canal de comprovantes.', ephemeral: true });

      const canal = interaction.guild.channels.cache.get(logsId);
      if (!canal) return interaction.reply({ content: '❌ Canal de comprovantes não existe mais.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('🧾 Novo Comprovante')
        .addFields(
          { name: 'Cliente', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
          { name: 'Valor', value: `R$ ${produto.preco.toFixed(2)}`, inline: true },
          { name: 'Comprovante', value: `[Clique aqui](${link})` },
        )
        .setTimestamp();

      if (produto.foto) embed.setThumbnail(produto.foto);

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`compra_aceitar_${interaction.user.id}`).setLabel('Aceitar').setEmoji('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`compra_recusar_${interaction.user.id}`).setLabel('Recusar').setEmoji('❌').setStyle(ButtonStyle.Danger),
      );

      const msg = await canal.send({ embeds: [embed], components: [botoes] });
      comprasPendentes.set(msg.id, { userId: interaction.user.id, produtoId });

      return interaction.reply({ content: '✅ Comprovante enviado! Aguarde a confirmação.', ephemeral: true });
    }
  }
});

// ====== Listener: foto de ticket + XP por mensagem ======
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const tipoId = esperandoFoto.get(message.author.id);
  if (tipoId) {
    const anexo = message.attachments.first();
    if (anexo && anexo.contentType?.startsWith('image/')) {
      setFotoTipo(tipoId, anexo.url);
      esperandoFoto.delete(message.author.id);
      return message.reply('✅ Foto salva!');
    }
  }

  const userId = message.author.id;
  const agora = Date.now();
  const ultimo = xpCooldown.get(userId) || 0;
  if (agora - ultimo < 60000) return;

  xpCooldown.set(userId, agora);

  const ganho = 15 + Math.floor(Math.random() * 11);
  const antes = getXp(userId);
  const depois = addXp(userId, ganho);

  if (depois.level > antes.level) {
    const roleId = getLevelRole(depois.level);
    if (roleId) {
      try { await message.member.roles.add(roleId); } catch {}
    }
    try {
      await message.channel.send(`🎉 <@${userId}> subiu pro **nível ${depois.level}**!`);
    } catch {}
  }
});

// ====== Bot online ======
client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  console.log(`📡 Servindo ${client.guilds.cache.size} servidor(es)`);
});

// ====== Express ======
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot online! 🤖'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`🌐 Web server na porta ${PORT}`));

// ====== Login ======
console.log('🔑 Tentando logar...');
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('✅ Login OK'))
  .catch((err) => { console.error('❌ Erro no login:', err.message); process.exit(1); });

// ====== Carrega e registra ======
(async () => {
  try {
    await loadCommands(client);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const commands = [...client.commands.values()].map(cmd => cmd.data.toJSON());
    console.log(`🔄 Registrando ${commands.length} comando(s) no Discord...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log(`✅ ${commands.length} comando(s) registrado(s)!`);
  } catch (err) {
    console.error('⚠️ Erro:', err.message);
  }
})();