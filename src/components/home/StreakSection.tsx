import React from "react";
import { Button, useDisclosure } from "@heroui/react";
import { FireAnimatedIcon } from "../svg/complex";
import { UserStreak } from "@/interfaces/common";
import StreakModal from "./StreakModal";
import { Bagel_Fat_One } from "next/font/google";

const bagelFatOne = Bagel_Fat_One({ subsets: ["latin"], weight: "400" });

type StreakSectionProps = {
  userStreak: UserStreak | null;
};

export default function StreakSection({ userStreak }: StreakSectionProps) {
  const streakModal = useDisclosure();

  return (
    <div className="flex w-full flex-col items-stretch justify-start">
      <Button
        variant="shadow"
        color="danger"
        radius="sm"
        startContent={<FireAnimatedIcon />}
        onPress={() => {
          streakModal.onOpen();
        }}
        className={`h-12 w-full text-3xl font-semibold ${bagelFatOne.className}`}
      >
        {userStreak?.current_streak || 1}
      </Button>

      <StreakModal
        isOpen={streakModal.isOpen}
        onOpenChange={streakModal.onOpenChange}
        onClose={streakModal.onClose}
        userStreak={userStreak}
      />
    </div>
  );
}
