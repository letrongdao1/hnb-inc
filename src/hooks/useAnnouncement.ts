import { ANNOUNCEMENT_TYPE } from "@/constants/enums";
import { addToast } from "@heroui/react";

const ANNOUNCEMENTS: Record<
  ANNOUNCEMENT_TYPE,
  {
    title: string;
    description?: string;
  }
> = {
  FEATURE_IN_MAINTENANCE: {
    title: "Tính năng đang được bảo trì",
    description:
      "Hệ thống đang thực hiện bảo trì hoặc nâng cấp tính năng để đem lại trải nghiệm tốt nhất cho HNB.",
  },
  FEATURE_UNAVAILABLE: {
    title: "Tính năng đang được phát triển",
    description:
      "Tính năng này đang trong quá trình phát triển cùng với sự nỗ lực hết mình từ phòng IT.",
  },
};

export function useAnnouncement() {
  const announce = (key: keyof typeof ANNOUNCEMENTS) => {
    if (!key) return;

    const type = ANNOUNCEMENTS[key];

    addToast({
      title: type.title,
      description: type.description || "",
      color: "warning",
    });
  };

  return { announce };
}
