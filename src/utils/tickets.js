// Guarda em memória a config de tickets
// { logsChannelId, tipos: [{ id, nome, emoji, foto }], contador }

export const config = {
  logsChannelId: null,
  tipos: [], // [{ id: 'tipo_xxx', nome: 'Suporte', emoji: '🎫', foto: null }]
  painelMessageId: null,
};

export function setLogsChannel(id) {
  config.logsChannelId = id;
}

export function getLogsChannel() {
  return config.logsChannelId;
}

export function addTipo(nome, emoji, foto = null) {
  const tipo = {
    id: `tipo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    nome,
    emoji: emoji || '🎫',
    foto,
  };
  config.tipos.push(tipo);
  return tipo;
}

export function removeTipo(id) {
  const antes = config.tipos.length;
  config.tipos = config.tipos.filter(t => t.id !== id);
  return config.tipos.length < antes;
}

export function getTipos() {
  return config.tipos;
}

export function setFotoTipo(id, url) {
  const tipo = config.tipos.find(t => t.id === id);
  if (tipo) tipo.foto = url;
  return tipo;
}

export function setPainelMessageId(id) {
  config.painelMessageId = id;
}

export function getPainelMessageId() {
  return config.painelMessageId;
}

// Tickets abertos em memória
export const ticketsAbertos = new Map(); // channelId -> { autorId, tipoId, reivindicadoPor }
