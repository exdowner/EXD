const saldos = new Map();     // userId -> pontos na mão
const bancos = new Map();     // userId -> pontos no banco
const cooldowns = new Map();  // userId:comando -> timestamp

export function getSaldo(id) { return saldos.get(id) || 0; }
export function getBanco(id) { return bancos.get(id) || 0; }
export function addSaldo(id, v) { saldos.set(id, Math.max(0, getSaldo(id) + v)); return getSaldo(id); }
export function addBanco(id, v) { bancos.set(id, Math.max(0, getBanco(id) + v)); return getBanco(id); }
export function setSaldo(id, v) { saldos.set(id, Math.max(0, v)); }
export function setBanco(id, v) { bancos.set(id, Math.max(0, v)); }

export function cooldownRestante(id, cmd, segundos) {
  const key = `${id}:${cmd}`;
  const ultimo = cooldowns.get(key) || 0;
  const agora = Date.now();
  const diff = (ultimo + segundos * 1000) - agora;
  if (diff > 0) return diff;
  cooldowns.set(key, agora);
  return 0;
}
