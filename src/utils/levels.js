const xp = new Map();
const xpConfig = { min: 15, max: 25, cooldown: 60 };
const levelRoles = new Map(); // nivel -> roleId

export function getXp(id) { return xp.get(id) || { xp: 0, level: 0 }; }
export function setXp(id, valor) { xp.set(id, { xp: valor, level: calcLevel(valor) }); return xp.get(id); }
export function addXp(id, v) { const atual = getXp(id); return setXp(id, atual.xp + v); }
export function getConfig() { return xpConfig; }
export function calcLevel(totalXp) { return Math.floor(0.1 * Math.sqrt(totalXp)); }
export function xpProximoNivel(level) { return Math.pow((level + 1) / 0.1, 2); }
export function setLevelRole(level, roleId) { levelRoles.set(level, roleId); }
export function getLevelRole(level) { return levelRoles.get(level); }
export function getLevelRoles() { return [...levelRoles.entries()]; }
