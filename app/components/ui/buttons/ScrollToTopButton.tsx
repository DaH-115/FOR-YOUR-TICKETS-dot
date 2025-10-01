"use client";

import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTopButton = () => {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTopHandler = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTopHandler}
      className={`fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 md:h-16 md:w-16 lg:bottom-18 lg:right-20 ${
        showScrollTopButton
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-5 opacity-0"
      }`}
      aria-label="맨 위로 스크롤"
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollToTopButton;
