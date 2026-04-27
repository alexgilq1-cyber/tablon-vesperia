"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  puntos_esencia: number;
};

type PerfilEditado = {
  nombre: string;
  imagen_url: string;
  puntos_esencia: number;
};

export default function AdminPage() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [nombre, setNombre] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState<Record<string, PerfilEditado>>({});

  async function cargarPerfiles() {
    const { data, error } = await supabase
      .from("perfiles")
      .select("id, nombre, imagen_url, puntos_esencia")
      .order("nombre", { ascending: true });

    if (error) {
      setMensaje(`Error al cargar perfiles: ${error.message}`);
      return;
    }

    const lista = (data ?? []) as Perfil[];
    setPerfiles(lista);

    const mapa: Record<string, PerfilEditado> = {};
    for (const perfil of lista) {
      mapa[perfil.id] = {
        nombre: perfil.nombre,
        imagen_url: perfil.imagen_url ?? "",
        puntos_esencia: perfil.puntos_esencia,
      };
    }
    setEditando(mapa);
  }

  useEffect(() => {
    cargarPerfiles();
  }, []);

  async function crearPerfil(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const { error } = await supabase.from("perfiles").insert({
      nombre,
      imagen_url: imagenUrl || null,
      puntos_esencia: Math.max(0, puntos),
    });

    setLoading(false);

    if (error) {
      setMensaje(`No se pudo crear el perfil: ${error.message}`);
      return;
    }

    setNombre("");
    setImagenUrl("");
    setPuntos(0);
    setMensaje("Perfil creado correctamente.");
    await cargarPerfiles();
  }

  async function guardarPerfil(id: string) {
    const datos = editando[id];
    if (!datos) return;

    setMensaje("");

    const { error } = await supabase
      .from("perfiles")
      .update({
        nombre: datos.nombre,
        imagen_url: datos.imagen_url || null,
        puntos_esencia: Math.max(0, Number(datos.puntos_esencia) || 0),
      })
      .eq("id", id);

    if (error) {
      setMensaje(`No se pudo guardar el perfil: ${error.message}`);
      return;
    }

    setMensaje("Perfil actualizado correctamente.");
    await cargarPerfiles();
  }

  async function eliminarPerfil(id: string) {
    setMensaje("");

    const confirmacion = window.confirm(
      "¿Seguro que quieres eliminar este perfil?"
    );

    if (!confirmacion) return;

    const { error } = await supabase.from("perfiles").delete().eq("id", id);

    if (error) {
      setMensaje(`No se pudo eliminar el perfil: ${error.message}`);
      return;
    }

    setMensaje("Perfil eliminado.");
    await cargarPerfiles();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-block border border-amber-200/30 bg-black/25 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al tablón
        </Link>

        <Link
          href="/admin/catalogo"
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Editar catálogo
        </Link>

        <Link
          href="/admin/historial"
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Historial
        </Link>
      </div>

      <section className="border border-amber-950/45 bg-black/30 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
        <p
          className="text-sm uppercase tracking-[0.35em] text-amber-300/75"
          style={{ fontFamily: "var(--font-medieval)" }}
        >
          Sala reservada
        </p>

        <h1
          className="mt-3 text-5xl leading-none text-amber-50"
          style={{ fontFamily: "var(--font-almendra)" }}
        >
          Panel del Master
        </h1>

        <p className="mt-4 max-w-2xl text-amber-100/85">
          Desde aquí puedes crear aventureros, editar sus datos y mantener el
          tablón del reino.
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={crearPerfil}
          className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
        >
          <h2
            className="text-3xl"
            style={{ fontFamily: "var(--font-almendra)" }}
          >
            Crear perfil
          </h2>

          <div className="mt-5 space-y-4">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del personaje"
              required
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />

            <input
              type="text"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="URL de la imagen"
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />

            <input
              type="number"
              value={puntos}
              onChange={(e) => setPuntos(Number(e.target.value))}
              min={0}
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 border border-stone-900 bg-stone-900 px-5 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          >
            {loading ? "Guardando..." : "Crear perfil"}
          </button>

          {mensaje ? (
            <p className="mt-4 text-sm text-stone-800">{mensaje}</p>
          ) : null}
        </form>

        <div className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
          <h2
            className="text-3xl"
            style={{ fontFamily: "var(--font-almendra)" }}
          >
            Editar jugadores
          </h2>

          <div className="mt-5 space-y-4">
            {perfiles.map((perfil) => (
              <div
                key={perfil.id}
                className="border border-amber-950/25 bg-white/45 p-4"
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editando[perfil.id]?.nombre ?? ""}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        [perfil.id]: {
                          ...prev[perfil.id],
                          nombre: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    placeholder="Nombre"
                  />

                  <input
                    type="text"
                    value={editando[perfil.id]?.imagen_url ?? ""}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        [perfil.id]: {
                          ...prev[perfil.id],
                          imagen_url: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    placeholder="URL de la imagen"
                  />

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-stone-700">
                        Puntos de Esencia
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editando[perfil.id]?.puntos_esencia ?? 0}
                        onChange={(e) =>
                          setEditando((prev) => ({
                            ...prev,
                            [perfil.id]: {
                              ...prev[perfil.id],
                              puntos_esencia: Number(e.target.value) || 0,
                            },
                          }))
                        }
                        className="w-28 border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => guardarPerfil(perfil.id)}
                        className="border border-stone-900 bg-stone-900 px-3 py-2 text-sm uppercase tracking-[0.12em] text-amber-50"
                      >
                        Guardar
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarPerfil(perfil.id)}
                        className="border border-red-900/40 px-3 py-2 text-sm text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {perfiles.length === 0 ? (
              <p className="text-sm text-stone-700">
                Aún no hay perfiles creados.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
