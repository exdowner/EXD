// Banco em memória de warns
// Map<userId, [{ id, motivo, autorId, data }]>

const warns = new Map();

export function addWarn(userId, motivo, autorId) {
  if (!warns.has(userId)) warns.set(userId, []);
  const lista = warns.get(userId);
  const warn = {
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    motivo,
    autorId,
    data: new Date().toISOString(),
  };
  lista.push(warn);
  return warn;
}

export function getWarns(userId) {
  return warns.get(userId) || [];
}

export function removeWarn(userId, warnId) {
  if (!warns.has(userId)) return false;
  const lista = warns.get(userId);
  const antes = lista.length;
  warns.set(userId, lista.filter(w => w.id !== warnId));
  return warns.get(userId).length < antes;
}

export function clearWarns(userId) {
  const antes = warns.get(userId)?.length || 0;
  warns.delete(userId);
  return antes;
}
