"use client";

import { create } from "zustand";
import { ChatMessage } from "@/interfaces/chat";

interface ChatState {
  messages: ChatMessage[];
  isTyping: string[];
  reactions: Record<string, Record<string, string>>;
  seenBy: Record<string, string[]>;
  hasMore: boolean;

  setMessages: (msgs: ChatMessage[]) => void;

  addMessage: (msg: ChatMessage) => void;
  updateMessageStatus: (messageId: string, status: ChatMessage["status"]) => void;

  addReaction: (messageId: string, userId: string, reaction: string) => void;
  removeReaction: (messageId: string, userId: string) => void;

  markSeen: (messageId: string, userId: string) => void;

  setTyping: (userId: string, typing: boolean) => void;

  fetchMessages: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: [],
  reactions: {},
  seenBy: {},
  hasMore: true,

  setMessages: (msgs) =>
    set(() => ({
      messages: msgs,
    })),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === messageId ? { ...m, status } : m)),
    })),

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

  setTyping: (userId, typing) =>
    set((state) => {
      const current = state.isTyping;
      const next = typing
        ? Array.from(new Set([...current, userId]))
        : current.filter((id) => id !== userId);
      return { isTyping: next };
    }),

  fetchMessages: async () => {
    const state = get();
    const oldest = state.messages[0]?.created_at || new Date().toISOString();

    const older = await fetch(`/api/chat/messages?before=${oldest}`).then((r) => r.json());

    set({
      messages: [...(older.data || []), ...state.messages],
      hasMore: older.length > 0,
    });
  },
}));
