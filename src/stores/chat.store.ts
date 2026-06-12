"use client";

import { create } from "zustand";
import { ChatMessage } from "@/interfaces/chat";
import { DEFAULT_MESSAGE_PAGE_SIZE } from "@/constants/constants";
import { BaseUserInfo } from "@/interfaces/user";

interface ChatState {
  messages: ChatMessage[];
  isTyping: BaseUserInfo[];
  reactions: Record<string, Record<string, string>>;
  seenBy: Record<string, string[]>;
  hasMore: boolean;
  isFetching: boolean;

  setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;

  addMessage: (msg: ChatMessage) => void;
  updateMessage: (data: ChatMessage, tempId: string) => void;

  addReaction: (messageId: string, userId: string, reaction: string) => void;
  removeReaction: (messageId: string, userId: string) => void;

  markSeen: (messageId: string, userId: string) => void;

  setTyping: (user: BaseUserInfo, typing: boolean) => void;

  fetchMessages: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: [],
  reactions: {},
  seenBy: {},
  hasMore: true,
  isFetching: false,

  setMessages: (fn) =>
    set((state) => ({
      messages: fn(state.messages),
    })),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  updateMessage: (data, tempId) =>
    set((state) => {
      if (!data || !tempId) return {};

      const index = state.messages.findIndex((msg) => msg.id === tempId);
      if (index === -1) return {};

      const newMessages = [...state.messages];
      newMessages[index] = { ...newMessages[index], ...data };

      return { messages: newMessages };
    }),

  addReaction: (messageId, userId, reaction) =>
    set((state) => {
      const r = state.reactions[messageId] ?? {};
      return {
        reactions: {
          ...state.reactions,
          [messageId]: {
            ...r,
            [userId]: reaction,
          },
        },
      };
    }),

  removeReaction: (messageId, userId) =>
    set((state) => {
      const r = state.reactions[messageId] ?? {};
      delete r[userId];
      return {
        reactions: {
          ...state.reactions,
          [messageId]: {
            ...r,
          },
        },
      };
    }),

  markSeen: (messageId, userId) =>
    set((state) => {
      const list = state.seenBy[messageId] ?? [];
      return {
        seenBy: {
          ...state.seenBy,
          [messageId]: list.includes(userId) ? list : [...list, userId],
        },
      };
    }),

  setTyping: (user, typing) =>
    set((state) => {
      const current = state.isTyping;
      const next = typing
        ? Array.from(new Set([...current, user]))
        : current.filter((u) => u.id !== user.id);
      return { isTyping: next };
    }),

  fetchMessages: async () => {
    const { messages, hasMore, isFetching } = get();

    if (isFetching || !hasMore) return;

    const oldest = messages[0]?.created_at ?? new Date().toISOString();

    set({ isFetching: true });

    try {
      const res = await fetch(`/api/chat/messages?before=${encodeURIComponent(oldest)}`);
      const json = await res.json();

      const olderMessages = (json.data ?? []).reverse();

      set((state) => ({
        messages: [...olderMessages, ...state.messages],
        hasMore: olderMessages.length === DEFAULT_MESSAGE_PAGE_SIZE,
      }));
    } catch (err) {
      console.error("fetchMessages failed", err);
    } finally {
      set({ isFetching: false });
    }
  },
}));
