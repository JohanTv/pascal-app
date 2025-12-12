import AnimatedHeader from "@/components/home/AnimatedHeader";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Home() {
  return (
    <div
      className="relative h-screen flex items-center justify-center
        bg-gradient-to-b from-[#052651] to-[#214ec3]
        dark:from-[#010d1a] dark:via-[#021b39] dark:to-[#0a2a70]"
    >
      <div className="absolute top-10 right-10 z-20">
        <ModeToggle />
      </div>
      <AnimatedHeader />
    </div>
  );
}
