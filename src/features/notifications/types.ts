import { Tables } from '~/core/database/supabase/database.types';

export type Notification = Pick<
  Tables<'notifications'>,
  'id' | 'body' | 'dismissed' | 'type' | 'created_at' | 'link'
>;
