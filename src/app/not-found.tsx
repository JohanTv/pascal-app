import { Compass, Home } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4
        bg-gradient-to-b from-[#052651] to-[#214ec3]
        dark:from-[#010d1a] dark:via-[#021b39] dark:to-[#0a2a70]"
    >
      <div className="absolute top-10 right-10 z-20">
        <ModeToggle />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-1.5 h-1.5 md:w-2 md:h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-75" />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 md:w-1.5 md:h-1.5 bg-white/25 rounded-full animate-pulse delay-150" />
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-300" />
      </div>

      <div className="text-center w-full max-w-2xl mx-auto relative z-10">
        <div className="mb-8 md:mb-12">
          <h1
            className="text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[16rem]
            font-black text-white/10 select-none leading-none tracking-tighter"
          >
            4
            <span className="inline-block animate-bounce text-white/20">0</span>
            4
          </h1>
        </div>

        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-xl" />
            <Compass
              className="relative w-16 h-16 md:w-20 md:h-20 text-white/60 animate-spin-slow"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl
          font-bold text-white mb-4 md:mb-6 tracking-tight px-4"
        >
          ¡Ups! Página Perdida en el Espacio
        </h2>

        <p
          className="text-base sm:text-lg md:text-xl lg:text-2xl
          text-white/90 mb-3 md:mb-4 font-light px-4"
        >
          Parece que esta página decidió tomarse unas vacaciones... sin avisar.
        </p>

        <p
          className="text-sm sm:text-base md:text-lg
          text-white/70 mb-8 md:mb-12 max-w-xl mx-auto px-4"
        >
          No te preocupes, hasta los mejores exploradores se pierden a veces. 🧭
        </p>

        <div className="flex justify-center px-4">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 md:gap-3
              bg-white text-[#052651]
              dark:bg-white dark:text-[#010d1a]
              w-full sm:w-auto
              px-6 sm:px-8 py-4 md:py-4
              rounded-lg font-semibold text-base md:text-lg
              transition-all duration-300
              hover:scale-105 hover:shadow-2xl hover:shadow-white/20
              active:scale-95
              min-h-[48px]"
          >
            <Home className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-y-0.5" />
            Volver a Casa
          </Link>
        </div>

        <p className="mt-12 md:mt-16 text-xs md:text-sm text-white/40 italic font-mono px-4">
          Error 404: PÁGINA_EN_VACACIONES
        </p>
      </div>
    </div>
  );
}
