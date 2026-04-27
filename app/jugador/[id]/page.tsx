import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

type Perfil = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  puntos_esencia: number;
};

type ItemCatalogo = {
  id: string;
  titulo: string;
  descripcion: string;
  coste: number;
  categoria: string;
};

export default async function JugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();

  const [{ data: perfil, error: perfilError }, { data: catalogo, error: catalogoError }] =
    await Promise.all([
      supabase
        .from("perfiles")
        .select("id, nombre, imagen_url, puntos_esencia")
        .eq("id", id)
        .single(),
      supabase
        .from("catalogo")
        .select("id, titulo, descripcion, coste, categoria")
        .order("coste", { ascending: true }),
    ]);

  if (perfilError || !perfil) {
    notFound();
  }

  if (catalogoError) {
    throw new Error(catalogoError.message);
  }

  const jugador = perfil as Perfil;
  const items = (catalogo ?? []) as ItemCatalogo[];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.8fr]">
        <div className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 overflow-hidden border-[3px] border-amber-950/35 bg-amber-200">
              {jugador.imagen_url ? (
                <img
                  src={jugador.imagen_url}
                  alt={jugador.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-4xl text-stone-800"
                  style={{ fontFamily: "var(--font-almendra)" }}
                >
                  {jugador.nombre.slice(0, 1)}
                </div>
              )}
            </div>

            <div>
              <p
                className="text-sm uppercase tracking-[0.28em] text-amber-950/80"
                style={{ fontFamily: "var(--font-medieval)" }}
              >
                Registro personal
              </p>

              <h1
                className="mt-2 text-5xl leading-none"
                style={{ fontFamily: "var(--font-almendra)" }}
              >
                {jugador.nombre}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-800/80">
                Aquí puedes consultar tu reserva de esencia y revisar las
                ofertas activas del Mercado del Mérito.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-amber-950/45 bg-black/35 p-6 text-amber-50 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <p
            className="text-sm uppercase tracking-[0.28em] text-amber-200/80"
            style={{ fontFamily: "var(--font-medieval)" }}
          >
            Estado
          </p>

          <div
            className="mt-4 text-6xl leading-none"
            style={{ fontFamily: "var(--font-almendra)" }}
          >
            {jugador.puntos_esencia}
          </div>

          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-amber-100/75">
            Puntos de Esencia
          </p>
        </div>
      </section>

      <section className="mt-8 border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
        <p
          className="text-sm uppercase tracking-[0.28em] text-amber-950/80"
          style={{ fontFamily: "var(--font-medieval)" }}
        >
          Mercado del Mérito
        </p>

        <h2
          className="mt-2 text-4xl"
          style={{ fontFamily: "var(--font-almendra)" }}
        >
          Catálogo
        </h2>

        <div className="mt-6 grid gap-4">
          {items.map((item, index) => (
            <article
              key={item.id}
              className={`border border-amber-950/25 bg-white/45 p-4 shadow-md ${
                index % 2 === 0 ? "rotate-[-0.4deg]" : "rotate-[0.4deg]"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-950/75">
                    {item.categoria}
                  </p>

                  <h3
                    className="mt-2 text-3xl leading-none"
                    style={{ fontFamily: "var(--font-almendra)" }}
                  >
                    {item.titulo}
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-800/80">
                    {item.descripcion}
                  </p>
                </div>

                <div className="border border-amber-950/30 bg-amber-100/70 px-4 py-3 text-sm uppercase tracking-[0.18em]">
                  {item.coste} PE
                </div>
              </div>
            </article>
          ))}

          {items.length === 0 ? (
            <p className="text-sm text-stone-700">
              No hay objetos disponibles en el catálogo.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
