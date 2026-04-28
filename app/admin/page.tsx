"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type ItemCatalogo = {
  id: string;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  categoria: string;
  localizacion: string | null;
  coste: number;
};

type ItemEditado = {
  titulo: string;
  descripcion: string;
  imagen_url: string;
  categoria: string;
  localizacion: string;
  coste: number;
};

type DropzoneProps = {
  label: string;
  currentImageUrl?: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
};

function DropzoneImagen({
  label,
  currentImageUrl = null,
  file,
  onFileChange,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFile(nextFile: File | null) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) return;
    onFileChange(nextFile);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-stone-700">{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`w-full border border-dashed px-4 py-5 text-center transition ${
          dragging
            ? "border-amber-900 bg-amber-100/70"
            : "border-amber-950/30 bg-white/70 hover:bg-white/80"
        }`}
      >
        <div className="mx-auto mb-3 h-24 w-24 overflow-hidden border-[3px] border-amber-950/30 bg-amber-100">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          ) : currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Imagen actual"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-stone-700">
              Sin imagen
            </div>
          )}
        </div>

        <p className="text-sm text-stone-800">
          Arrastra una imagen aquí o haz clic para subirla
        </p>
      </button>

      {file ? (
        <div className="flex items-center justify-between gap-2 text-xs text-stone-700">
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="border border-amber-950/25 px-3 py-2"
          >
            Quitar
          </button>
        </div>
      ) : null}
    </div>
  );
}

const categorias = [
  "Armas",
  "Scrolls",
  "Permisos",
  "Pociones",
  "Reliquias",
  "Objetos mágicos",
  "Otros",
];

const localizaciones = [
  "",
  "Protectorado de Pira",
  "Unión del Hielo",
  "Reino de Oakhaven",
  "Baronía de Hierro",
  "Confed. Río Plata",
  "Teocracia del Monolito",
  "Liga de la Planicie",
  "Enclave de Puerto Gris",
];

export default function AdminCatalogoPage() {
  const [items, setItems] = useState<ItemCatalogo[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Armas");
  const [localizacion, setLocalizacion] = useState("");
  const [coste, setCoste] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<Record<string, ItemEditado>>({});
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
  const [archivosEditar, setArchivosEditar] = useState<Record<string, File | null>>({});

  async function subirImagen(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { error?: string; url?: string };

    if (!response.ok || !payload.url) {
      throw new Error(payload.error ?? "No se pudo subir la imagen.");
    }

    return payload.url;
  }

  async function cargarCatalogo() {
    const { data, error } = await supabase
      .from("catalogo")
      .select("id, titulo, descripcion, imagen_url, categoria, localizacion, coste")
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
        localizacion: item.localizacion ?? "",
        coste: item.coste,
      };
    }
    setEditando(mapa);
    setArchivosEditar({});
  }

  useEffect(() => {
    cargarCatalogo();
  }, []);

  async function crearItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      let imagenUrl: string | null = null;

      if (archivoNuevo) {
        imagenUrl = await subirImagen(archivoNuevo);
      }

      const { error } = await supabase.from("catalogo").insert({
        titulo,
        descripcion,
        imagen_url: imagenUrl,
        categoria,
        localizacion: localizacion || null,
        coste: Math.max(0, coste),
      });

      setLoading(false);

      if (error) {
        setMensaje(`No se pudo crear el objeto: ${error.message}`);
        return;
      }

      setTitulo("");
      setDescripcion("");
      setCategoria("Armas");
      setLocalizacion("");
      setCoste(0);
      setArchivoNuevo(null);
      setMensaje("Objeto añadido al catálogo.");
      await cargarCatalogo();
    } catch (error) {
      setLoading(false);
      setMensaje(error instanceof Error ? error.message : "No se pudo crear el objeto.");
    }
  }

  async function guardarItem(id: string) {
    const datos = editando[id];
    if (!datos) return;

    setMensaje("");

    try {
      let imagenFinal = datos.imagen_url || null;
      const archivo = archivosEditar[id];

      if (archivo) {
        imagenFinal = await subirImagen(archivo);
      }

      const { error } = await supabase
        .from("catalogo")
        .update({
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          imagen_url: imagenFinal,
          categoria: datos.categoria,
          localizacion: datos.localizacion || null,
          coste: Math.max(0, Number(datos.coste) || 0),
        })
        .eq("id", id);

      if (error) {
        setMensaje(`No se pudo guardar el objeto: ${error.message}`);
        return;
      }

      setMensaje("Objeto actualizado correctamente.");
      await cargarCatalogo();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo guardar el objeto.");
    }
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
        <a
          href="/"
          className="inline-block border border-amber-200/30 bg-black/25 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al tablón
        </a>

        <a
          href="/admin"
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al Master
        </a>
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
          Aquí puedes crear y editar los objetos que verán los jugadores en su perfil.
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

            <DropzoneImagen
              label="Imagen del objeto"
              file={archivoNuevo}
              currentImageUrl={null}
              onFileChange={setArchivoNuevo}
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            >
              {categorias.map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>

            <select
              value={localizacion}
              onChange={(e) => setLocalizacion(e.target.value)}
              className="w-full border border-amber-950/30 bg-white/75 px-4 py-3 text-stone-900 outline-none"
            >
              <option value="">Sin localización</option>
              {localizaciones
                .filter((loc) => loc !== "")
                .map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
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

                  <DropzoneImagen
                    label="Imagen del objeto"
                    file={archivosEditar[item.id] ?? null}
                    currentImageUrl={editando[item.id]?.imagen_url ?? ""}
                    onFileChange={(file) =>
                      setArchivosEditar((prev) => ({
                        ...prev,
                        [item.id]: file,
                      }))
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-3">
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
                      {categorias.map((opcion) => (
                        <option key={opcion}>{opcion}</option>
                      ))}
                    </select>

                    <select
                      value={editando[item.id]?.localizacion ?? ""}
                      onChange={(e) =>
                        setEditando((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            localizacion: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-amber-950/30 bg-white/80 px-3 py-2 text-stone-900 outline-none"
                    >
                      <option value="">Sin localización</option>
                      {localizaciones
                        .filter((loc) => loc !== "")
                        .map((loc) => (
                          <option key={loc}>{loc}</option>
                        ))}
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
