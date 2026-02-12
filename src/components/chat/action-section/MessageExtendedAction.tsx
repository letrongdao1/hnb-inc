"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { ImageIcon, MemeIcon } from "@/components/svg";

export default function MessageExtendedAction() {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "fit-content" }}
      exit={{ width: 0 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      className="flex h-1 items-center justify-start gap-2"
    >
      <Button variant="bordered" startContent={<ImageIcon />} isIconOnly />
      <Button variant="bordered" startContent={<MemeIcon />} isIconOnly />
    </motion.div>
  );
}
