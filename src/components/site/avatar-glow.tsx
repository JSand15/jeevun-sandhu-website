"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function AvatarGlow() {
  return (
    <div className="relative inline-flex">
      <motion.div
        aria-hidden="true"
        className="bg-brand absolute -inset-4 rounded-full blur-2xl"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="ring-brand/50 absolute -inset-1 rounded-full ring-1"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <Image
        src="/avatar.png"
        alt="Jeevun Sandhu"
        width={144}
        height={144}
        priority
        className="relative size-28 rounded-full object-cover sm:size-36"
      />
    </div>
  );
}
