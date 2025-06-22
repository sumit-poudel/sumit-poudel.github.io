"use client";

import { motion } from "motion/react";

const Loading = () => {
  const dotVariants = {
    pulse: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      animate="pulse"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className=" flex justify-center items-center gap-2 h-6.5 "
    >
      <motion.div
        className=" w-2 h-2 rounded-full will-change-transform dark:bg-white bg-black "
        variants={dotVariants}
      />
      <motion.div
        className=" w-2 h-2 rounded-full will-change-transform dark:bg-white bg-black "
        variants={dotVariants}
      />
      <motion.div
        className=" w-2 h-2 rounded-full will-change-transform dark:bg-white bg-black "
        variants={dotVariants}
      />
    </motion.div>
  );
};

export default Loading;
