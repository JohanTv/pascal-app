"use client";

import { motion } from "motion/react";

export default function AnimatedHeader() {
  return (
    <motion.h1
      initial={{ opacity: 0, x: -100 }}
      animate={{
        x: [-100, 0, 0, -100, -100],
        opacity: [0, 1, 1, 0, 0],
      }}
      transition={{
        duration: 10,
        times: [0, 0.25, 0.8, 0.9, 1],
        ease: ["easeOut", "linear", "linear", "easeIn"],
        repeat: Infinity,
      }}
      className="text-6xl font-black tracking-widest sm:text-8xl md:text-9xl text-white"
    >
      PASCAL
    </motion.h1>
  );
}
