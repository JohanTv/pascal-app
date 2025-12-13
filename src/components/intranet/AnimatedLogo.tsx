"use client";

import { motion } from "motion/react";

export default function AnimatedLogo() {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{
          x: [-50, 0, 0, -50, -50],
          opacity: [0, 1, 1, 0, 0],
        }}
        transition={{
          duration: 10,
          times: [0, 0.25, 0.8, 0.9, 1],
          ease: ["easeOut", "linear", "linear", "easeIn"],
          repeat: Infinity,
        }}
        className="text-center"
      >
        <h1 className="text-4xl font-black tracking-wider text-white md:text-6xl lg:text-7xl">
          CRM
        </h1>
        <h1 className="text-4xl font-black tracking-wider text-white md:text-6xl lg:text-7xl">
          Pascal
        </h1>
      </motion.div>
    </div>
  );
}
