import React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import BUILDING_IMAGE from "@/assets/images/home/building.webp";
import HIT_BUILDING_IMAGE from "@/assets/images/home/building-hit.png";

export default function HeroSection() {
  return (
    <div className="h-[330vh] w-full">
      <motion.div
        variants={boxVariants}
        initial="hidden"
        animate={["visible", "bounce", "spin"]}
        className="aspect-square w-24 rounded-md bg-orange-800"
      ></motion.div>

      <div className="flex items-center justify-center gap-4">
        <motion.img
          variants={buildingVariants}
          initial="hidden"
          animate={["visibleFast"]}
          src={BUILDING_IMAGE.src}
          alt=""
          className="aspect-[3/8] w-40 mask-b-from-70% mask-b-to-100%"
        />
        <motion.img
          variants={buildingVariants}
          initial="hidden"
          animate={["visibleSlow"]}
          src={HIT_BUILDING_IMAGE.src}
          alt=""
          className="aspect-[3/8] w-44 -translate-y-2 mask-b-from-70% mask-b-to-100%"
        />
      </div>
    </div>
  );
}

const boxVariants: Variants = {
  hidden: { opacity: 0, x: -200, y: -200, rotate: 0 },
  visible: {
    opacity: 1,
    x: 500,
    y: 200,
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
  },
  bounce: {
    y: [0, -30, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  spin: {
    rotate: 360,
    transition: {
      ease: "linear",
      repeat: Infinity,
      duration: 4,
      delay: 1,
    },
  },
};

const buildingVariants: Variants = {
  hidden: { opacity: 0, y: -500 },
  visibleFast: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5, ease: "easeOut" },
  },
  visibleSlow: {
    opacity: 1,
    y: 0,
    transition: { duration: 2, ease: "easeIn" },
  },
};
