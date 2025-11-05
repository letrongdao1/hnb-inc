export interface EventTag {
  id: number;
  tag_name: string;
  status: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  venue_name: string;
  venue_instruction?: string;
  start_date: string;
  start_time?: string;
  tags?: string;
  has_alcohol: boolean;
  description: string;
  image?: string;
  is_ended: boolean;
  created_at: string;
  participants?: {
    event: string;
    user: {
      id: string;
      display_name: string;
      avatar: string;
    };
    created_at: string;
  }[];
  is_joined?: boolean;
}

export interface EventParticipation {
  user: string;
  event: string;
  created_at: string;
}

export interface EventCost {
  id: string;
  user: {
    id: string;
    display_name: string;
    avatar: string;
  };
  event: string;
  type: string;
  amount: number;
  note?: string;
  created_at: string;
}
