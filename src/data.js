export const DB_NAME = 'minhas-receitas-tm7';
let connection;
export function openDB() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('recipes', { keyPath: 'id' });
    request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); connection = undefined; }; resolve(db); };
    request.onerror = () => { connection = undefined; reject(request.error); };
    request.onblocked = () => { connection = undefined; reject(new Error('Feche os outros separadores da aplicação e tente novamente.')); };
  });
  return connection;
}
export async function allRecipes() {
  const db = await openDB();
  return new Promise((resolve, reject) => { const r = db.transaction('recipes').objectStore('recipes').getAll(); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
}
export async function writeRecipes(recipes, replace = false) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recipes', 'readwrite'); const store = tx.objectStore('recipes');
    if (replace) store.clear();
    recipes.forEach(r => store.put(r));
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error || new Error('Operação cancelada.'));
  });
}
export async function deleteRecipe(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => { const tx = db.transaction('recipes', 'readwrite'); tx.objectStore('recipes').delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
}
const str = (v, max = 10000) => typeof v === 'string' && v.length <= max;
export function validateRecipe(r) {
  if (!r || !str(r.id, 100) || !r.id || !str(r.name, 150) || !r.name.trim() || !str(r.category, 80) || !Number.isInteger(r.servings) || r.servings < 1 || r.servings > 999 || !Number.isFinite(r.minutes) || r.minutes < 0 || r.minutes > 10080) throw new Error('Dados da receita inválidos.');
  if (!Array.isArray(r.ingredients) || !r.ingredients.length || r.ingredients.length > 300 || r.ingredients.some(i => !i || !str(i.name, 500) || !i.name.trim() || !str(i.quantity, 100))) throw new Error('Ingredientes inválidos.');
  if (!Array.isArray(r.steps) || !r.steps.length || r.steps.length > 300 || r.steps.some(s => !s || !str(s.text) || !s.text.trim() || !str(s.time, 80) || !str(s.temperature, 80) || !str(s.speed, 80) || typeof s.reverse !== 'boolean')) throw new Error('Passos inválidos.');
  if (r.photo !== null && (!str(r.photo, 8000000) || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(r.photo))) throw new Error('Fotografia inválida.');
  return {id:r.id,name:r.name.trim(),category:r.category.trim() || 'Outras',servings:r.servings,minutes:r.minutes,ingredients:r.ingredients.map(i=>({name:i.name.trim(),quantity:i.quantity})),steps:r.steps.map(s=>({text:s.text,time:s.time,temperature:s.temperature,speed:s.speed,reverse:s.reverse})),photo:r.photo};
}
export function parseBackup(text) {
  const data = JSON.parse(text);
  if (!data || data.format !== 'tm7-recipes' || data.version !== 1 || !Array.isArray(data.recipes) || data.recipes.length > 2000) throw new Error('Formato de cópia de segurança não suportado.');
  const recipes = data.recipes.map(validateRecipe);
  if (new Set(recipes.map(r=>r.id)).size !== recipes.length) throw new Error('O ficheiro contém identificadores repetidos.');
  return recipes;
}
export const backupJSON = recipes => JSON.stringify({format:'tm7-recipes',version:1,exportedAt:new Date().toISOString(),recipes},null,2);
export const matches = (r, query, category) => (!category || r.category === category) && r.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT'));
