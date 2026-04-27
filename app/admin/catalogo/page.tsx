"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ItemCatalogo = {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  categoria: string;
  coste: number;
};

type ItemEditado = {
  titulo: string;
  descripcion: string;
  imagen_url: string;
  categoria: string;
  coste: number;
};

export default function AdminCatalogoPage() {
  const [items, setItems] = useState<ItemCatalogo[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [categoria, setCategoria] = useState("Armas");
  const [coste, setCoste] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<Record<string, ItemEditado>>({});

  async function cargarCatalogo() {
    const { data, error } = await supabase
      .from("catalogo")
      .select("id, titulo, descripcion, imagen_url, categoria, coste")
      .order("categoria", { ascending: true });

    if (error) {
      setMensaje(`No se pudo cargar el catálogo: ${error.message}`);
      return;
    }

    const lista = (data ?? []) as ItemCatalogo[];
    setItems(lista);

    const mapa: Record<string, ItemEditado> = {};
    for (const item of lista) {
      mapa[item.id] = {
        titulo: item.titulo,
        descripcion: item.descripcion,
        imagen_url: item.imagen_url ?? "",
        categoria: item.categoria,
        coste: item.coste,
      };
    }
    setEditando(mapa);
  }

  useEffect(() => {
    cargarCatalogo();
  }, []);

  async function crearItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const { error } = await supabase.from("catalogo").insert({
      titulo,
      descripcion,
      imagen_url: imagenUrl || null,
      categoria,
      coste: Math.max(0, coste),
    });

    setLoading(false);

    if (error) {
      setMensaje(`No se pudo crear el objeto: ${error.message}`);
      return;
    }

    setTitulo("");
    setDescripcion("");
    setImagenUrl("");
    setCategoria("Armas");
    setCoste(0);
    setMensaje("Objeto añadido al catálogo.");
    await cargarCatalogo();
  }

  async function guardarItem(id: string) {
    const datos = editando[id];
    if (!datos) return;

    setMensaje("");

    const { error } = await supabase
      .from("catalogo")
      .update({
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        imagen_url: datos.imagen_url || null,
        categoria: datos.categoria,
        coste: Math.max(0, Number(datos.coste) || 0),
      })
      .eq("id", id);

    if (error) {
      setMensaje(`No se pudo guardar el objeto: ${error.message}`);
      return;
    }

    setMensaje("Objeto actualizado correctamente.");
    await cargarCatalogo();
  }

  async function eliminarItem(id: string) {
    setMensaje("");

    const confirmacion = window.confirm(
      "¿Seguro que quieres eliminar este objeto del catálogo?"
    );

    if (!confirmacion) return;

    const { error } = await supabase.from("catalogo").delete().eq("id", id);

    if (error) {
      setMensaje(`No se pudo eliminar el objeto: ${error.message}`);
      return;
    }

    setMensaje("Objeto eliminado.");
    await cargarCatalogo();
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
          href="/admin"
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al Master
        </Link>
      </div>

      <section className="border border-amber-950/45 bg-black/30 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
        <p
          className="text-sm uppercase tracking-[0.35em] text-amber-300/75"
          style={{ fontFamily: "var(--font-medieval)" }}
        >
          Archivo del reino
        </p>

        <h1
          className="mt-3 text-5xl leading-none text-amber-50"
          style={{ fontFamily: "var(--font-almendra)" }}
        >
          Catálogo del Master
        </h1>

        <p className="mt-4 max-w-2xl text-amber-100/85">
          Aquí puedes crear y editar los objetos que verán los jugadores en su
          perfil.
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={crearItem}
          className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
        >
          <h2
            className="text-3xl"
            style={{ fontFamily: "var(--font-almendra)" }}
          >
            Añadir objeto
          </h2>

          <div className="mt-5 space-y-4">
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nombre del objeto"
              required
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              required
              className="min-h-32 w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />

            <input
              type="text"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="URL de la imagen"
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            >
              <option>Armas</option>
              <option>Scrolls</option>
              <option>Permisos</option>
              <option>Pociones</option>
              <option>Reliquias</option>
              <option>Objetos mágicos</option>
              <option>Otros</option>
            </select>

            <input
              type="number"
              value={coste}
              onChange={(e) => setCoste(Number(e.target.value))}
              min={0}
              placeholder="Coste"
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 border border-stone-900 bg-stone-900 px-5 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          >
            {loading ? "Guardando..." : "Añadir objeto"}
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
            Editar catálogo
          </h2>

          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-amber-950/25 bg-white/45 p-4"
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editando[item.id]?.titulo ?? ""}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          titulo: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    placeholder="Nombre"
                  />

                  <textarea
                    value={editando[item.id]?.descripcion ?? ""}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          descripcion: e.target.value,
                        },
                      }))
                    }
                    className="min-h-28 w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    placeholder="Descripción"
                  />

                  <input
                    type="text"
                    value={editando[item.id]?.imagen_url ?? ""}
                    onChange={(e) =>
                      setEditando((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          imagen_url: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    placeholder="URL de la imagen"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={editando[item.id]?.categoria ?? "Otros"}
                      onChange={(e) =>
                        setEditando((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            categoria: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    >
                      <option>Armas</option>
                      <option>Scrolls</option>
                      <option>Permisos</option>
                      <option>Pociones</option>
                      <option>Reliquias</option>
                      <option>Objetos mágicos</option>
                      <option>Otros</option>
                    </select>

                    <input
                      type="number"
                      min={0}
                      value={editando[item.id]?.coste ?? 0}
                      onChange={(e) =>
                        setEditando((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            coste: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                      placeholder="Coste"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => guardarItem(item.id)}
                      className="border border-stone-900 bg-stone-900 px-3 py-2 text-sm uppercase tracking-[0.12em] text-amber-50"
                    >
                      Guardar
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarItem(item.id)}
                      className="border border-red-900/40 px-3 py-2 text-sm text-red-900"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 ? (
              <p className="text-sm text-stone-700">
                Aún no hay objetos en el catálogo.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
