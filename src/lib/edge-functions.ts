import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Deployed edge functions, verified against the live project (2026-07-15).
 * Note: the backend integration PDF calls the mind-map relay "ai-proxy",
 * but the deployed function is named "mind-map".
 */
export type EdgeFunctionName =
  | 'mind-map'
  | 'paper-insights'
  | 'manuscript-ingestion'
  | 'proofreading'
  | 'journal-formatting'

/**
 * Calls one of the Supabase edge functions. Every function verifies the
 * user JWT and applies rate limiting, so a session is required.
 */
export async function callEdgeFunction<T = unknown>(
  name: EdgeFunctionName,
  body: Record<string, unknown>
): Promise<T> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('NO_SESSION')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })

  if (response.status === 429) {
    throw new Error('RATE_LIMITED')
  }

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300)
    throw new Error(`EDGE_FUNCTION_ERROR ${response.status} on ${name}: ${detail}`)
  }

  return response.json()
}

/**
 * Mind map keywords (contract verified live 2026-07-15):
 * { topic } → { keywords: [{ keyword, description }] }.
 */
export async function generateMindMap(topic: string) {
  return callEdgeFunction('mind-map', { topic })
}
