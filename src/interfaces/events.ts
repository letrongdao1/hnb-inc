import { BaseUserInfo } from "./user";

export enum EventStatusEnum {
  IN_PROGRESS = 1,
  FINALIZING = 2,
  ENDED = 3,
}

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
  start_at: string;
  tags?: string;
  has_alcohol: boolean;
  description: string;
  image?: string;
  status: EventStatusEnum;
  is_cost_split: boolean;
  will_pay_user?: BaseUserInfo;
  is_will_pay_user?: boolean;
  created_at: string;
  participants?: {
    event: string;
    user: BaseUserInfo;
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
  user: BaseUserInfo;
  event: string;
  type: string;
  amount: number;
  note?: string;
  created_at: string;
}
