// ─── Typed D1 query helpers ────────────────────────────────────────────────

export interface DbTenant {
  id: string;
  name: string;
  plan: string;
  created_at: number;
}

export interface DbUser {
  id: string;
  tenant_id: string;
  email: string;
  password: string;
  role: string;
  created_at: number;
}

export interface DbForm {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  blocks: string; // JSON
  logo_url: string | null;
  active: number; // 0 | 1
  created_at: number;
  updated_at: number;
}

export interface DbShareToken {
  token: string;
  form_id: string;
  expires_at: number | null;
  created_at: number;
  share_count: number;
}

export interface DbResponse {
  id: string;
  form_id: string;
  tenant_id: string;
  applicant: string; // JSON
  data: string; // JSON
  status: string;
  starred: number;
  submitted_at: number;
  reviewed_at: number | null;
  approved_at: number | null;
}

export interface DbFileUpload {
  id: string;
  response_id: string | null;
  r2_key: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: number;
}

// ─── Query helpers ─────────────────────────────────────────────────────────

export async function queryOne<T>(
  db: D1Database,
  query: string,
  params: unknown[] = []
): Promise<T | null> {
  const result = await db.prepare(query).bind(...params).first<T>();
  return result ?? null;
}

export async function queryAll<T>(
  db: D1Database,
  query: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await db.prepare(query).bind(...params).all<T>();
  return result.results;
}

export async function execute(
  db: D1Database,
  query: string,
  params: unknown[] = []
): Promise<D1Result> {
  return db.prepare(query).bind(...params).run();
}

/** Paginate any query. Injects LIMIT / OFFSET automatically. */
export async function queryPaginated<T>(
  db: D1Database,
  query: string,
  params: unknown[],
  page: number,
  pageSize: number
): Promise<{ items: T[]; hasMore: boolean }> {
  const offset = (page - 1) * pageSize;
  const result = await db
    .prepare(`${query} LIMIT ? OFFSET ?`)
    .bind(...params, pageSize + 1, offset)
    .all<T>();

  const hasMore = result.results.length > pageSize;
  return {
    items: result.results.slice(0, pageSize),
    hasMore,
  };
}
