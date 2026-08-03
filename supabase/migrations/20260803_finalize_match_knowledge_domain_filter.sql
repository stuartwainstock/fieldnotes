-- Ticket 06: finalize match_knowledge after phase→domain rename.
-- Verification complete: filter_type accepts any document_type text
-- (including glossary/decision); filter_domain matches metadata.domains.
-- Drop the temporary metadata->'phases' legacy OR now that content is migrated.

create or replace function public.match_knowledge(
  query_embedding vector,
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

comment on function public.match_knowledge(vector, integer, text, text, text) is
  'Cosine similarity search over knowledge_embeddings. Optional filters: document_type, metadata.confidence, metadata.domains (domain document id).';
