"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export default function JugadorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [catalogo, setCatalogo] = useState<ItemCatalogo[]>([]);
  const [nombre, setNombre] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    setMensaje("");

    const [
      { data: perfilData, error: perfilError },
      { data: catalogoData, error: catalogoError },
    ] = await Promise.all([
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

    if (perfilError) {
      setMensaje(`No se pudo cargar el perfil: ${perfilError.message}`);
      setLoading(false);
      return;
    }

    if (catalogoError) {
      setMensaje(`No se pudo cargar el catálogo: ${catalogoError.message}`);
      setLoading(false);
      return;
    }

    const perfilCargado = perfilData as Perfil;
    setPerfil(perfilCargado);
    setCatalogo((catalogoData ?? []) as ItemCatalogo[]);
    setNombre(perfilCargado.nombre);
    setImagenUrl(perfilCargado.imagen_url ?? "");
    setPuntos(perfilCargado.puntos_esencia);
    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");

    const { error } = await supabase
      .from("perfiles")
      .update({
        nombre,
        imagen_url: imagenUrl || null,
      })
      .eq("id", id);

    if (error) {
      setMensaje(`No se pudo guardar el perfil: ${error.message}`);
      return;
    }

    setMensaje("Perfil actualizado correctamente.");
    await cargarDatos();
    setMostrarPerfil(false);
  }

  async function guardarPuntos(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");

    const { error } = await supabase
      .from("perfiles")
      .update({
        puntos_esencia: Math.max(0, puntos),
      })
      .eq("id", id);

    if (error) {
      setMensaje(`No se pudieron guardar los puntos: ${error.message}`);
      return;
    }

    setMensaje("Puntos de Esencia actualizados.");
    await cargarDatos();
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-amber-50">Cargando perfil...</p>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-block border border-amber-200/30 bg-black/25 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al tablón
        </Link>

        <p className="mt-6 text-red-200">{mensaje || "Perfil no encontrado."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-block border border-amber-200/30 bg-black/25 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al tablón
        </Link>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.8fr]">
        <div className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 overflow-hidden border-[3px] border-amber-950/35 bg-amber-200">
              {perfil.imagen_url ? (
                <img
                  src={perfil.imagen_url}
                  alt={perfil.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-4xl text-stone-800"
                  style={{ fontFamily: "var(--font-almendra)" }}
                >
                  {perfil.nombre.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="flex-1">
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
                {perfil.nombre}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-800/80">
                Aquí puedes consultar tu reserva de esencia, revisar las ofertas
                activas del Mercado del Mérito y mantener tu ficha al día.
              </p>

              <button
                type="button"
                onClick={() => setMostrarPerfil((prev) => !prev)}
                className="mt-4 border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-50"
              >
                Perfil
              </button>

              {mostrarPerfil ? (
                <form
                  onSubmit={guardarPerfil}
                  className="mt-4 space-y-3 border border-amber-950/25 bg-white/45 p-4"
                >
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                    required
                    className="w-full border border-amber-950/30 bg-white/80 px-4 py-3 text-stone-900 outline-none"
                  />

                  <input
                    type="text"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    placeholder="URL de la imagen"
                    className="w-full border border-amber-950/30 bg-white/80 px-4 py-3 text-stone-900 outline-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-50"
                    >
                      Guardar perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => setMostrarPerfil(false)}
                      className="border border-amber-950/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-900"
                    >
                      Cerrar
                    </button>
                  </div>
                </form>
              ) : null}
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
            {perfil.puntos_esencia}
          </div>

          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-amber-100/75">
            Puntos de Esencia
          </p>

          <form onSubmit={guardarPuntos} className="mt-6 space-y-3">
            <label className="block text-sm text-amber-100/85">
              Editar puntos
            </label>
            <input
              type="number"
              value={puntos}
              onChange={(e) => setPuntos(Number(e.target.value))}
              min={0}
              className="w-full border border-amber-200/25 bg-white/90 px-4 py-3 text-stone-900 outline-none"
            />
            <button
              type="submit"
              className="border border-amber-100/30 bg-amber-50/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-50"
            >
              Guardar puntos
            </button>
          </form>

          {mensaje ? (
            <p className="mt-4 text-sm text-amber-100">{mensaje}</p>
          ) : null}
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
          {catalogo.map((item, index) => (
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

          {catalogo.length === 0 ? (
            <p className="text-sm text-stone-700">
              No hay objetos disponibles en el catálogo.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
