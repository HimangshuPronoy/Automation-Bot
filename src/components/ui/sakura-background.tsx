"use client";

import { useEffect, useState } from "react";

export const SakuraBackground = () => {
  const [petals, setPetals] = useState<Array<{ left: string; delay: string; duration: string; width: string; height: string }>>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${5 + Math.random() * 10}s`,
      width: `${10 + Math.random() * 8}px`,
      height: `${10 + Math.random() * 8}px`
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="petals-container">
      {petals.map((style, i) => (
        <div 
          key={i} 
          className="petal"
          style={{
            left: style.left,
            animationDelay: style.delay,
            animationDuration: style.duration,
            width: style.width,
            height: style.height
          }} 
        />
      ))}
    </div>
  );
};
