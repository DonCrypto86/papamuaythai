alter table public.products
  add column if not exists name_de text,
  add column if not exists name_en text,
  add column if not exists short_note_de text,
  add column if not exists short_note_en text,
  add column if not exists sizes_de text,
  add column if not exists sizes_en text;
