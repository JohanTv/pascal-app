import { Building2, DollarSign, MapPin } from "lucide-react";

const projects = [
  {
    id: "torre-begonias",
    name: "Torre Begonias Luxury",
    location: "San Isidro, Lima",
    developer: "Inmobiliaria Platinum",
    priceFrom: "$250,000",
    image: "/api/placeholder/400/300",
    description: "Exclusivos departamentos con vista al golf",
  },
  {
    id: "barranco-vibe",
    name: "Residencial Barranco Vibe",
    location: "Barranco, Lima",
    developer: "Inmobiliaria Urbana",
    priceFrom: "$140,000",
    image: "/api/placeholder/400/300",
    description: "Vive el estilo bohemio en pleno Barranco",
  },
  {
    id: "eco-olivar",
    name: "Eco-Condominio El Olivar",
    location: "Jesús María, Lima",
    developer: "Inmobiliaria Vida Verde",
    priceFrom: "$110,000",
    image: "/api/placeholder/400/300",
    description: "Espacios verdes y sustentabilidad urbana",
  },
];

export function ProjectShowcase() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm transition-all hover:bg-white/15 hover:scale-105"
        >
          <div className="aspect-video w-full bg-gradient-to-br from-blue/20 to-blue-dark/40" />

          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">{project.name}</h3>
              <p className="mt-1 text-sm text-white/70">
                {project.description}
              </p>
            </div>

            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{project.developer}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-yellow">
                  Desde {project.priceFrom}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-lg bg-yellow px-4 py-2 font-semibold text-blue-dark transition-colors hover:bg-yellow/90"
            >
              Más información
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
