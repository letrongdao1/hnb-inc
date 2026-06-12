"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { ImageIcon, MemeIcon } from "@/components/svg";
import MemeList from "@/components/memes/MemeList";

export default function MessageExtendedAction() {
  const [isMemeOpen, setIsMemeOpen] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "fit-content" }}
      exit={{ width: 0 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      className="flex h-1 items-center justify-start gap-2"
    >
      <Button variant="bordered" startContent={<ImageIcon />} isIconOnly />

      <Popover
        isOpen={isMemeOpen}
        onOpenChange={(open) => setIsMemeOpen(open)}
        shouldCloseOnBlur={false}
        shouldCloseOnScroll={false}
        placement="top-start"
      >
        <PopoverTrigger>
          <Button variant="bordered" startContent={<MemeIcon />} isIconOnly />
        </PopoverTrigger>
        <PopoverContent className={`h-full`}>
          <MemeList />
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}
