import React from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import BUILDING_IMAGE from "@/assets/images/home/building.webp";
import HIT_BUILDING_IMAGE from "@/assets/images/home/building-hit.png";
import { Nabla } from "next/font/google";

const nabla = Nabla({ subsets: ["latin"], weight: "400" });

export default function HeroSection() {
  return (
    <div className="h-[330vh] w-full">
      {/* <motion.div
        variants={boxVariants}
        initial="hidden"
        animate={["visible", "bounce", "spin"]}
        className="aspect-square w-24 rounded-md bg-orange-800"
      ></motion.div> */}

      <div className="flex items-center justify-center gap-4">
        <motion.p
          variants={H_Variants}
          initial="hidden"
          animate={["visible", "swing"]}
          className={`${nabla.className} text-[10em]`}
        >
          H
        </motion.p>
        <motion.p
          variants={N_Variants}
          initial="hidden"
          animate={["visible", "swing"]}
          className={`${nabla.className} text-[10em]`}
        >
          N
        </motion.p>
        <motion.p
          variants={B_Variants}
          initial="hidden"
          animate={["visible", "swing"]}
          className={`${nabla.className} text-[10em]`}
        >
          B
        </motion.p>
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

const H_Variants: Variants = {
  hidden: { opacity: 0, y: -500 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5, ease: "easeOut", delay: 0.2 },
  },
  swing: {
    rotate: [-12, 12, -12],
    transition: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
  },
};

const N_Variants: Variants = {
  hidden: { opacity: 0, y: -400 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 2, ease: "easeOut" },
  },
  swing: {
    rotate: [-14, 14, -14],
    transition: { duration: 3.2, ease: "easeInOut", repeat: Infinity },
  },
};

const B_Variants: Variants = {
  hidden: { opacity: 0, y: -450 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 2.5, ease: "easeOut" },
  },
  swing: {
    rotate: [-10, 10, -10],
    transition: { duration: 2.9, ease: "easeInOut", repeat: Infinity },
  },
};
