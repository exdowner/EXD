// Estado em memória da loja
// { pix: { tipo, chave, nome }, logsComprasChannelId, produtos: [] }

export const lojaConfig = {
  pix: { tipo: null, chave: null, nome: null },
  logsComprasChannelId: null,
  produtos: [], // [{ id, nome, descricao, preco, entrega, emoji }]
};

export function setPix(tipo, chave, nome) {
  lojaConfig.pix = { tipo, chave, nome };
}

export function getPix() {
  return lojaConfig.pix;
}

export function setLogsCompras(id) {
  lojaConfig.logsComprasChannelId = id;
}

export function getLogsCompras() {
  return lojaConfig.logsComprasChannelId;
}

export function addProduto(nome, descricao, preco, entrega, emoji = '🛒') {
  const produto = {
    id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    nome,
    descricao,
    preco,
    entrega,
    emoji,
  };
  lojaConfig.produtos.push(produto);
  return produto;
}

export function removeProduto(id) {
  const antes = lojaConfig.produtos.length;
  lojaConfig.produtos = lojaConfig.produtos.filter(p => p.id !== id);
  return lojaConfig.produtos.length < antes;
}

export function updateProduto(id, campo, valor) {
  const produto = lojaConfig.produtos.find(p => p.id === id);
  if (!produto) return false;
  produto[campo] = valor;
  return true;
}

export function getProduto(id) {
  return lojaConfig.produtos.find(p => p.id === id);
}

export function getProdutos() {
  return lojaConfig.produtos;
}
