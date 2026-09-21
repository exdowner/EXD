// Banco de pontos em memória (reinicia quando o bot reinicia)
// Depois trocamos por um banco de verdade

const pontos = new Map();

export function getPontos(userId) {
  return pontos.get(userId) || 0;
}

export function setPontos(userId, valor) {
  pontos.set(userId, Math.max(0, valor));
  return pontos.get(userId);
}

export function addPontos(userId, valor) {
  return setPontos(userId, getPontos(userId) + valor);
}

export function removePontos(userId, valor) {
  return setPontos(userId, getPontos(userId) - valor);
}

export function ranking() {
  return [...pontos.entries()].sort((a, b) => b[1] - a[1]);
}
