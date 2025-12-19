import { BaseUserInfo } from "./user";

export enum ChatMessageTypeEnum {
  TEXT = "text",
  IMAGE = "img",
  SYSTEM = "sys",
}

export enum ChatMessageStatusEnum {
  SENDING = 0,
  SENT = 1,
  DELIVERED = 2,
  SEEN = 3,
}

export enum ChatThreadStatusEnum {
  ACTIVE = 1,
  CLOSED = 2,
}

export type ChatMessage = {
  id: string;
  sender?: BaseUserInfo;
  thread?: string;
  content?: string;
  attachment_url?: string;
  metadata?: any;
  replied_to?: string;
  is_pinned: boolean;
  type: ChatMessageTypeEnum;
  status: ChatMessageStatusEnum;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  is_mine?: boolean;
};

export type ChatThread = {
  id: string;
  created_by: BaseUserInfo;
  title: string;
  description?: string;
  status: ChatThreadStatusEnum;
  last_message?: ChatMessage;
  created_at: string;
  closed_at?: string;
};

export type MessageSeen = {
  user: BaseUserInfo;
  last_message: string;
  updated_at: string;
};
