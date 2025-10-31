export interface EventTag {
  id: number;
  tag_name: string;
  status: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  venue_name: string;
  venue_instruction?: string;
  start_date: string;
  start_time?: string;
  tags?: string;
  has_alcohol: boolean;
  description: string;
  image?: string;
  created_at: string;
  participants?: {
    id: string;
    display_name: string;
    avatar: string;
  }[];
  is_joined?: boolean;
}

export interface EventParticipation {
  user: string;
  event: string;
  created_at: string;
}
