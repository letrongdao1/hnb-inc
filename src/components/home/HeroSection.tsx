import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Nabla } from "next/font/google";
import { Badge, Button, useDisclosure } from "@heroui/react";
import { FireAnimatedIcon } from "../svg/complex";
import { UserStreak } from "@/interfaces/common";
import { useUser } from "@/providers/user.provider";
import StreakModal from "./StreakModal";

const nabla = Nabla({ subsets: ["latin"], weight: "400" });

type HomeProps = {
  userStreak: UserStreak | null;
};

export default function HeroSection({ userStreak }: HomeProps) {
  const { user } = useUser();

  const streakModal = useDisclosure();

  const greetingTextSplit = "Xin chào, ".split("");

  const userNameSplit = useMemo(() => user?.display_name.split("") || "", [user]);

  const containerVariant: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      },
    },
  };

  const wordVariant: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.12, ease: "easeOut" },
    },
  };

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      {user && (
        <div>
          <motion.p
            variants={containerVariant}
            initial="hidden"
            animate="show"
            className="line-clamp-2 text-sm md:text-base"
          >
            {greetingTextSplit.map((word, i) => (
              <motion.span key={i} variants={wordVariant} className="mr-1 inline-block text-xs">
                {word + " "}
              </motion.span>
            ))}
            {userNameSplit &&
              userNameSplit.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordVariant}
                  className="inline-block font-semibold whitespace-pre"
                >
                  {word + " "}
                </motion.span>
              ))}
          </motion.p>
        </div>
      )}
      <Button
        variant="faded"
        color="default"
        startContent={<FireAnimatedIcon />}
        onPress={() => {
          streakModal.onOpen();
        }}
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
