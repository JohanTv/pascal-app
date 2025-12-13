import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewUserPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h2>
        <p className="text-muted-foreground">
          Crea un nuevo usuario en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            Los usuarios solo podrán acceder si son creados previamente por un
            administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Formulario de creación de usuario pendiente de implementación.
            <br />
            El usuario solo podrá iniciar sesión con Google OAuth si su email
            está registrado aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
