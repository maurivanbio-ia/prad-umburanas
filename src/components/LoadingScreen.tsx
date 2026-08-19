"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-grafite text-white">
      {/* Animated Spinner */}
      <div className="relative mb-8 h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FDB813] border-r-[#FDB813]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />
      </div>

      {/* Title */}
      <h1 className="mb-3 text-lg font-bold tracking-widest text-[#FDB813]">
        UMBURANAS • GEOPORTAL 3D
      </h1>

      {/* Subtitle */}
      <p className="text-sm font-light text-gray-400">
        Carregando gêmeo digital, nuvem LiDAR e ortomosaico de alta resolução...
      </p>
    </div>
  );
}
