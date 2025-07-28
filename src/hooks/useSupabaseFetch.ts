export async function useSupabaseFetch<T = unknown>(
  url: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const headers = {
    Accept: "application/json",
    ...(init.headers || {}),
  } as HeadersInit;

  if (!init.skipAuth) {
    headers.apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
