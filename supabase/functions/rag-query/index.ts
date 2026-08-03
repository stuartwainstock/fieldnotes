import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const SUPABASE_URL   = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_MATCH_COUNT = 8;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** Generate a query embedding via OpenAI. */
async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings error: ${res.status} ${err}`);
  }
  const json = await res.json();
  return json.data[0].embedding;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: {
    query: string;
    match_count?: number;
    filter_type?: string;
    filter_confidence?: string;
    filter_domain?: string;
    /** @deprecated use filter_domain */
    filter_phase?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const query = body.query?.trim();
  if (!query) {
    return new Response(JSON.stringify({ error: "query is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Embed the question
    const queryEmbedding = await embed(query);

    // 2. Call the match_knowledge RPC
    const filterDomain = body.filter_domain ?? body.filter_phase ?? null;
    const { data, error } = await supabase.rpc("match_knowledge", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: body.match_count ?? DEFAULT_MATCH_COUNT,
      filter_type: body.filter_type ?? null,
      filter_confidence: body.filter_confidence ?? null,
      filter_domain: filterDomain,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        matches: data ?? [],
        query,
        match_count: (data ?? []).length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
