import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Perfil = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  puntos_esencia: number;
};

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("perfiles")
    .select("id, nombre, imagen_url, puntos_esencia")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const perfiles = (data ?? []) as Perfil[];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="notice-board p-8">
        <p
          className="text-sm uppercase tracking-[0.35em] text-amber-300/75"
          style={{ fontFamily: "var(--font-medieval)" }}
        >
          Reino de Vesperia
        </p>

        <h1
          className="mt-3 text-5xl leading-none text-amber-50 sm:text-6xl"
          style={{ fontFamily: "var(--font-almendra)" }}
        >
          Tablón de Anuncios
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-amber-100/85">
          Bienvenido al tablón del reino. Cada pergamino conduce al panel de un
          jugador. El Consejo de Vesperia custodia el mercado, los puntos de
          esencia y el registro de cada trato.
        </p>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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

          <p className="mt-4 text-sm leading-6 text-stone-800/80">
            Entra al panel del Master para crear perfiles, ajustar PE y vigilar
            el reino.
          </p>
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
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-stone-800/75">
                  Ver perfil
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
