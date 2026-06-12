import { ChatDateGroupedMessage, ChatGroupedMessage, ChatMessage } from "@/interfaces/chat";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export const SPLIT_IMAGE_INTERVAL = 1000 * 60 * 10;

export const ChatUtils = {
  groupMessages: (messages: ChatMessage[]) => {
    const dateGroups: ChatDateGroupedMessage[] = [];

    const getDateKey = (d: Date) => d.toISOString().split("T")[0];

    const dateMap = new Map<string, ChatMessage[]>();

    for (const msg of messages) {
      const msgDate = new Date(msg.created_at);
      const key = getDateKey(msgDate);

      if (!dateMap.has(key)) {
        dateMap.set(key, []);
      }

      dateMap.get(key)!.push(msg);
    }

    for (const [dateKey, msgs] of dateMap.entries()) {
      const sortedMsgs = msgs.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const groups: ChatGroupedMessage[] = [];
      let currentGroup: ChatGroupedMessage | null = null;

      for (const msg of sortedMsgs) {
        const msgTime = new Date(msg.created_at);

        const shouldStartNewGroup =
          !currentGroup ||
          currentGroup.senderId !== msg.sender?.id ||
          msgTime.getTime() - currentGroup.sentAt.getTime() > SPLIT_IMAGE_INTERVAL;

        if (shouldStartNewGroup) {
          currentGroup = {
            senderId: msg.sender?.id,
            sender: msg.sender,
            sentAt: msgTime,
            messages: [],
          };

          groups.push(currentGroup);
        }

        currentGroup?.messages.push(msg);
      }

      dateGroups.push({
        date: new Date(dateKey),
        groups,
      });
    }

    dateGroups.sort((a, b) => a.date.getTime() - b.date.getTime());

    return dateGroups;
  },

  isDifferentDate: (prev: string | null, curr: string): boolean => {
    if (!prev) return true;

    const prevDate = new Date(prev);
    const currDate = new Date(curr);

    return (
      prevDate.getFullYear() !== currDate.getFullYear() ||
      prevDate.getMonth() !== currDate.getMonth() ||
      prevDate.getDate() !== currDate.getDate()
    );
  },

  getMessageTimeDisplay: (time: string): string => {
    if (!time) return "";

    const date = dayjs(time);

    if (date.isToday()) {
      return dayjs(date).format("hh:mm A");
    }
    if (date.isYesterday()) return `Hôm qua ${dayjs(date).format("hh:mm A")}`;
    return dayjs(date).format("DD/MM/YYYY hh:mm A");
  },

  getMessageGroupSplitterTimeDisplay: (time: string | Date): string => {
    if (!time) return "";

    const date = dayjs(time);
    if (date.isToday()) return "Hôm nay";
    if (date.isYesterday()) return "Hôm qua";

    return dayjs(date).format("DD MMMM, YYYY");
  },
};
