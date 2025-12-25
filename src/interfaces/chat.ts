import { BaseUserInfo } from "./user";

export enum ChatMessageTypeEnum {
  SYSTEM = 0,
  TEXT = 1,
  IMAGE = 2,
  VIDEO = 3,
  FILE = 4,
}

export enum ChatMessageStatusEnum {
  SENT_FAILED = -1,
  SENDING = 0,
  SENT = 1,
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

export type ChatGroupedMessage = {
  senderId?: string;
  sender?: BaseUserInfo;
  sentAt: Date;
  messages: ChatMessage[];
};

export type ChatDateGroupedMessage = {
  date: Date;
  groups: ChatGroupedMessage[];
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
