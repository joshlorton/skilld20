const CONFIG = {
  owner: 'joshlorton',
  repo: 'skilld20',
  api: 'https://api.github.com',
} as const;

const TOKEN_KEY = 'skd20_token';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setToken(token: string): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  const token = getToken();
  if (token) headers.Authorization = `token ${token}`;
  return headers;
}

export class GitHubConflictError extends Error {
  status = 409 as const;
  constructor() {
    super('GitHub 409: Conflict');
  }
}

export interface GhFile<T> {
  data: T;
  sha: string | null;
}

/**
 * Load a JSON file from the repo.
 * With a token: uses the GitHub Contents API (supports private repos).
 * Without a token: plain static fetch (viewer mode).
 * Returns null if the file can't be read.
 */
export async function ghReadFile<T>(path: string): Promise<GhFile<T> | null> {
  if (getToken()) {
    const resp = await fetch(
      `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
      { headers: ghHeaders() },
    );
    if (!resp.ok) return null;
    const raw = (await resp.json()) as { content: string; sha: string };
    const bin = atob(raw.content.replace(/\n/g, ''));
    const text = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    return { data: JSON.parse(text) as T, sha: raw.sha };
  }

  const resp = await fetch(`./${path}`);
  if (!resp.ok) return null;
  return { data: (await resp.json()) as T, sha: null };
}

/**
 * Write a JSON payload to the repo via the GitHub Contents API.
 * Returns the new blob SHA on success.
 * Throws GitHubConflictError on a 409 so callers can re-fetch and retry.
 */
export async function ghWriteFile(
  path: string,
  sha: string | null,
  data: unknown,
  message: string,
): Promise<string> {
  const json = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const content = btoa(binary);

  const resp = await fetch(
    `${CONFIG.api}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content, sha }),
    },
  );

  if (resp.status === 409) throw new GitHubConflictError();
  if (!resp.ok) throw new Error(`GitHub ${resp.status}: ${resp.statusText}`);

  const result = (await resp.json()) as { content: { sha: string } };
  return result.content.sha;
}

/**
 * Save a JSON payload, retrying once after refreshing the SHA on conflict.
 * Mirrors attemptSave()/isRetry in the vanilla section scripts.
 */
export async function saveWithConflictRetry<T>(
  path: string,
  sha: string | null,
  data: T,
  message: string,
): Promise<{ sha: string }> {
  try {
    const newSha = await ghWriteFile(path, sha, data, message);
    return { sha: newSha };
  } catch (err) {
    if (err instanceof GitHubConflictError) {
      const fresh = await ghReadFile<T>(path);
      const newSha = await ghWriteFile(path, fresh?.sha ?? null, data, message);
      return { sha: newSha };
    }
    throw err;
  }
}
