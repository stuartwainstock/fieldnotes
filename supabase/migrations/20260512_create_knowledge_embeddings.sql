-- Bootstrap for a fresh fieldnotes Supabase project.
-- Enables pgvector and creates knowledge_embeddings + webhook_log + match_knowledge.
-- chat_queries is in 20260518_create_chat_queries.sql.
-- Later migrations (20260803_*) assume this base exists.

create extension if not exists vector with schema extensions;

create table if not exists public.knowledge_embeddings (
  id uuid default gen_random_uuid() primary key,
  sanity_id text not null,
  document_type text not null,
  title text not null,
  content_text text not null,
  embedding extensions.vector(1536),
  metadata jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create unique index if not exists uq_sanity_id on public.knowledge_embeddings (sanity_id);
create index if not exists ix_knowledge_embeddings_type on public.knowledge_embeddings (document_type);
create index if not exists ix_knowledge_embeddings_vector
  on public.knowledge_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.knowledge_embeddings enable row level security;

comment on table public.knowledge_embeddings is
  'Vectorised snapshots of Sanity knowledge-base documents for RAG retrieval.';

create table if not exists public.webhook_log (
  id uuid default gen_random_uuid() primary key,
  sanity_id text not null,
  event text not null,
  status text not null default 'pending',
  error_detail text,
  created_at timestamptz default now()
);

create index if not exists ix_webhook_log_created on public.webhook_log (created_at desc);

alter table public.webhook_log enable row level security;

comment on table public.webhook_log is
  'Audit trail for Sanity webhook events processed by the embedding pipeline.';

-- Final domain-filter signature (post ticket 06). Fresh projects skip the phase→domain rename path.
create or replace function public.match_knowledge(
  query_embedding extensions.vector,
  match_count integer default 8,
  filter_type text default null,
  filter_confidence text default null,
  filter_domain text default null
)
returns table (
  id uuid,
  sanity_id text,
  document_type text,
  title text,
  content_text text,
  metadata jsonb,
  similarity double precision
)
language plpgsql
stable
set search_path = public, extensions
as $$
begin
  return query
    select
      ke.id,
      ke.sanity_id,
      ke.document_type,
      ke.title,
      ke.content_text,
      ke.metadata,
      1 - (ke.embedding <=> query_embedding) as similarity
    from public.knowledge_embeddings ke
    where
      (filter_type is null or ke.document_type = filter_type)
      and (filter_confidence is null or ke.metadata->>'confidence' = filter_confidence)
      and (filter_domain is null or ke.metadata->'domains' ? filter_domain)
    order by ke.embedding <=> query_embedding
    limit match_count;
end;
$$;

comment on function public.match_knowledge(extensions.vector, integer, text, text, text) is
  'Cosine similarity search over knowledge_embeddings. Optional filters: document_type, metadata.confidence, metadata.domains (domain document id).';
