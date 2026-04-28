import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Perfil = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  puntos_esencia: number;
  descripcion_personaje: string | null;
};

type AppConfig = {
  id: number;
  fondo_inicio_url: string | null;
  fondo_admin_url: string | null;
};

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const [{ data: perfilesData, error: perfilesError }, { data: configData }] =
    await Promise.all([
      supabase
        .from("perfiles")
        .select("id, nombre, imagen_url, puntos_esencia, descripcion_personaje")
        .order("nombre", { ascending: true }),
      supabase
        .from("app_config")
        .select("id, fondo_inicio_url, fondo_admin_url")
        .eq("id", 1)
        .maybeSingle(),
    ]);

  if (perfilesError) {
    throw new Error(perfilesError.message);
  }

  const perfiles = (perfilesData ?? []) as Perfil[];
  const config = configData as AppConfig | null;

  const customBackground = config?.fondo_inicio_url?.trim() || "";

  return (
    <main
      className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      style={
        customBackground
          ? {
              backgroundImage: `linear-gradient(rgba(20,10,6,0.55), rgba(20,10,6,0.55)), url("${customBackground}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/login"
          className="relative block overflow-hidden parchment-card p-5 transition hover:-translate-y-1 hover:rotate-[-1deg]"
          style={{ textDecoration: "none" }}
        >
          <div className="absolute right-5 top-5 wax-seal" />

          <p
            className="text-xs uppercase tracking-[0.25em] text-red-950/80"
            style={{ fontFamily: "var(--font-medieval)" }}
          >
            Acceso reservado
          </p>

          <h2
            className="mt-3 max-w-[12rem] text-4xl leading-none"
            style={{ fontFamily: "var(--font-almendra)" }}
          >
            Consejo de Vesperia
          </h2>
        </Link>

        {perfiles.map((perfil, index) => (
          <Link
            key={perfil.id}
            href={`/jugador/${perfil.id}`}
            className={`block parchment-card p-5 transition hover:-translate-y-1 ${
              index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"
            }`}
            style={{ textDecoration: "none", color: "#22150f" }}
          >
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 overflow-hidden border-[3px] border-amber-950/40 bg-amber-200 shadow-inner">
                {perfil.imagen_url ? (
                  <img
                    src={perfil.imagen_url}
                    alt={perfil.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-3xl"
                    style={{ fontFamily: "var(--font-almendra)" }}
                  >
                    {perfil.nombre.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-xs uppercase tracking-[0.25em] text-amber-950/70"
                  style={{ fontFamily: "var(--font-medieval)" }}
                >
                  Aventurero
                </p>

                <h2
                  className="mt-2 text-3xl leading-none"
                  style={{ fontFamily: "var(--font-almendra)" }}
                >
                  {perfil.nombre}
                </h2>

                {perfil.descripcion_personaje ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-800/80">
                    {perfil.descripcion_personaje}
                  </p>
                ) : (
                  <p className="mt-3 text-sm uppercase tracking-[0.18em] text-stone-800/75">
                    Ver perfil
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
