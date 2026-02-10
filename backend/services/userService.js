import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichier de stockage JSON (temporaire, à remplacer par une vraie DB)
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Initialiser le fichier si nécessaire
async function ensureDataFile() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Charger tous les utilisateurs
 */
async function loadUsers() {
  await ensureDataFile();
  const data = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

/**
 * Sauvegarder les utilisateurs
 */
async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Créer un utilisateur
 */
export async function createUser(userData) {
  const users = await loadUsers();
  users.push(userData);
  await saveUsers(users);
  return userData;
}

/**
 * Récupérer un utilisateur par ID
 */
export async function getUserById(userId) {
  const users = await loadUsers();
  return users.find(u => u.id === userId);
}

/**
 * Récupérer un utilisateur par email
 */
export async function getUserByEmail(email) {
  const users = await loadUsers();
  return users.find(u => u.email === email);
}

/**
 * Mettre à jour un utilisateur
 */
export async function updateUser(userId, updates) {
  const users = await loadUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    throw new Error('Utilisateur non trouvé');
  }

  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  return users[index];
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(userId) {
  const users = await loadUsers();
  const filtered = users.filter(u => u.id !== userId);
  await saveUsers(filtered);
  return true;
}

/**
 * Récupérer tous les utilisateurs (admin)
 */
export async function getAllUsers(options = {}) {
  const users = await loadUsers();
  const { limit = 100, offset = 0 } = options;
  
  return users.slice(offset, offset + limit);
}
