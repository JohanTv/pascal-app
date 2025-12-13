import { ChatWidget } from "@/components/chat/chat-widget";
import { ProjectShowcase } from "@/components/home/project-showcase";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#052651] to-[#214ec3] dark:from-[#010d1a] dark:via-[#021b39] dark:to-[#0a2a70]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-6">
        <div className="text-2xl font-bold text-white">Pascal</div>
        <ModeToggle />
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="max-w-4xl text-center">
          <h1 className="bg-gradient-to-r from-white via-white to-yellow bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl">
            Pascal: El sistema operativo que mueve el Real Estate
          </h1>
          <p className="mt-6 text-lg text-white/90 md:text-xl">
            Inteligencia artificial y velocidad al servicio de tus proyectos
            inmobiliarios
          </p>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="relative px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
            Proyectos Disponibles
          </h2>
          <ProjectShowcase />
        </div>
      </section>

      {/* Chat Widget (Floating) */}
      <ChatWidget />
    </div>
  );
}
