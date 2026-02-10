import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_FILE = path.join(__dirname, '../data/sessions.json');

async function ensureDataFile() {
  try {
    await fs.access(SESSIONS_FILE);
  } catch {
    await fs.mkdir(path.dirname(SESSIONS_FILE), { recursive: true });
    await fs.writeFile(SESSIONS_FILE, JSON.stringify([], null, 2));
  }
}

async function loadSessions() {
  await ensureDataFile();
  const data = await fs.readFile(SESSIONS_FILE, 'utf8');
  return JSON.parse(data);
}

async function saveSessions(sessions) {
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export async function createSession(sessionData) {
  const sessions = await loadSessions();
  sessions.push(sessionData);
  await saveSessions(sessions);
  return sessionData;
}

export async function getSessionById(sessionId) {
  const sessions = await loadSessions();
  return sessions.find(s => s.id === sessionId);
}

export async function getUserSessions(userId, options = {}) {
  const sessions = await loadSessions();
  let userSessions = sessions.filter(s => s.userId === userId);
  
  if (options.status) {
    userSessions = userSessions.filter(s => s.status === options.status);
  }
  
  const { limit = 50, offset = 0 } = options;
  return userSessions
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(offset, offset + limit);
}

export async function updateSession(sessionId, updates) {
  const sessions = await loadSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  
  if (index === -1) {
    throw new Error('Session non trouvée');
  }

  sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
  await saveSessions(sessions);
  return sessions[index];
}

export async function deleteSession(sessionId) {
  const sessions = await loadSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  await saveSessions(filtered);
  return true;
}
