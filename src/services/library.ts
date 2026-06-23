import { supabase } from '@/lib/supabaseClient';
import { libraryItems as fixture } from '@/data/mockSources';
import type { LibraryItem } from '@/lib/types';

// ============================================================
// Library service
// ------------------------------------------------------------
// CRUD for the Research Library, backed by Supabase. Falls back
// to the bundled fixture when Supabase isn't configured, so the
// app keeps working with no backend.
// ============================================================

const TABLE = 'research_items';

interface Row {
  id: string;
  title: string;
  symbol: string;
  type: string;
  status: LibraryItem['status'];
  created_at: string;
  updated_at: string;
}

// '2024-05-20T10:30:00+00:00' -> '2024-05-20 10:30'
function fmt(ts: string): string {
  return (ts || '').replace('T', ' ').slice(0, 16);
}

function toItem(r: Row): LibraryItem {
  return {
    id: r.id,
    title: r.title,
    symbol: r.symbol,
    type: r.type,
    status: r.status,
    createdAt: fmt(r.created_at),
    updatedAt: fmt(r.updated_at),
  };
}

/** List items, newest first. Falls back to fixture on any failure. */
export async function listLibraryItems(): Promise<LibraryItem[]> {
  if (!supabase) return fixture;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return fixture;
    return (data as Row[]).map(toItem);
  } catch {
    return fixture;
  }
}

/**
 * Persist a new item. Returns the saved item, or null if Supabase
 * isn't configured (caller keeps its optimistic local copy).
 */
export async function saveLibraryItem(
  item: Pick<LibraryItem, 'id' | 'title' | 'symbol' | 'type' | 'status'> & { payload?: unknown },
): Promise<LibraryItem | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        id: item.id,
        title: item.title,
        symbol: item.symbol,
        type: item.type,
        status: item.status,
        payload: item.payload ?? null,
      })
      .select()
      .single();
    if (error || !data) return null;
    return toItem(data as Row);
  } catch {
    return null;
  }
}

/** Delete an item. Returns true on success. */
export async function deleteLibraryItem(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
