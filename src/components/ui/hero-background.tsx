'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HeroBackground = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute -top-[25%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-900/10 mix-blend-multiply dark:mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2,
        }}
        className="absolute top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-400/20 blur-[120px] dark:bg-purple-900/10 mix-blend-multiply dark:mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 4,
        }}
        className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-900/10 mix-blend-multiply dark:mix-blend-screen"
      />
    </div>
  );
};
