import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database types for the conversation system
export interface Conversation {
  id: string;
  workspace_id: string;
  title: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'contact' | 'agent' | 'system';
  sender_id: string | null;
  text: string;
  data: any;
  created_at: string;
}

export interface Person {
  id: string;
  workspace_id: string;
  owner_id: string;
  full_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  workspace_id: string;
  owner_id: string;
  kind: string;
  title: string;
  details: string | null;
  status: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  workspace_id: string;
  owner_id: string;
  kind: string;
  a_id: string;
  b_id: string;
  goal_id: string | null;
  score: number;
  why: any;
  draft: any;
  state: string;
  created_at: string;
}
