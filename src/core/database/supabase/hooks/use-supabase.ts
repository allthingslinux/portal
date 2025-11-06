import { useMemo } from 'react';

import { getSupabaseBrowserClient } from '../clients/browser-client';
import { Database } from '../database.types';

export function useSupabase<Db = Database>() {
  return useMemo(() => getSupabaseBrowserClient<Db>(), []);
}
