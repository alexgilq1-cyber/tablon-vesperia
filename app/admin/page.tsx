"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type AppConfig = {
  id: number;
  fondo_inicio_url: string | null;
  fondo_admin_url: string | null;
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

export default function AdminPage() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [nombre, setNombre] = useState("");
  const [puntos, setPuntos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [editando, setEditando] = useState<Record<string, PerfilEditado>>({});
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [fondoInicioUrl, setFondoInicioUrl] = useState("");
  const [fondoAdminUrl, setFondoAdminUrl] = useState("");
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
  const [archivosEditar, setArchivosEditar] = useState<Record<string, File | null>>({});
  const [archivoFondoInicio, setArchivoFondoInicio] = useState<File | null>(null);
  const [archivoFondoAdmin, setArchivoFondoAdmin] = useState<File | null>(null);

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
    setArchivosEditar({});
  }

  async function cargarAjustes() {
    const { data } = await supabase
      .from("app_config")
      .select("id, fondo_inicio_url, fondo_admin_url")
      .eq("id", 1)
      .maybeSingle();

    const config = data as AppConfig | null;
    setFondoInicioUrl(config?.fondo_inicio_url ?? "");
    setFondoAdminUrl(config?.fondo_admin_url ?? "");
  }

  useEffect(() => {
    cargarPerfiles();
    cargarAjustes();
  }, []);

  async function crearPerfil(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      let imagenUrl: string | null = null;

      if (archivoNuevo) {
        imagenUrl = await subirImagen(archivoNuevo);
      }

      const { error } = await supabase.from("perfiles").insert({
        nombre,
        imagen_url: imagenUrl,
        puntos_esencia: Math.max(0, puntos),
      });

      setLoading(false);

      if (error) {
        setMensaje(`No se pudo crear el perfil: ${error.message}`);
        return;
      }

      setNombre("");
      setPuntos(0);
      setArchivoNuevo(null);
      setMensaje("Perfil creado correctamente.");
      await cargarPerfiles();
    } catch (error) {
      setLoading(false);
      setMensaje(error instanceof Error ? error.message : "No se pudo crear el perfil.");
    }
  }

  async function guardarPerfil(id: string) {
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
        .from("perfiles")
        .update({
          nombre: datos.nombre,
          imagen_url: imagenFinal,
          puntos_esencia: Math.max(0, Number(datos.puntos_esencia) || 0),
        })
        .eq("id", id);

      if (error) {
        setMensaje(`No se pudo guardar el perfil: ${error.message}`);
        return;
      }

      setMensaje("Perfil actualizado correctamente.");
      await cargarPerfiles();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    }
  }

  async function guardarAjustes(e: React.FormEvent) {
    e.preventDefault();
    setMensaje("");

    try {
      let fondoInicioFinal = fondoInicioUrl || null;
      let fondoAdminFinal = fondoAdminUrl || null;

      if (archivoFondoInicio) {
        fondoInicioFinal = await subirImagen(archivoFondoInicio);
      }

      if (archivoFondoAdmin) {
        fondoAdminFinal = await subirImagen(archivoFondoAdmin);
      }

      const { error } = await supabase
        .from("app_config")
        .update({
          fondo_inicio_url: fondoInicioFinal,
          fondo_admin_url: fondoAdminFinal,
        })
        .eq("id", 1);

      if (error) {
        setMensaje(`No se pudieron guardar los ajustes: ${error.message}`);
        return;
      }

      setFondoInicioUrl(fondoInicioFinal ?? "");
      setFondoAdminUrl(fondoAdminFinal ?? "");
      setArchivoFondoInicio(null);
      setArchivoFondoAdmin(null);
      setMensaje("Ajustes guardados correctamente.");
      await cargarAjustes();
      setMostrarAjustes(false);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudieron guardar los ajustes.");
    }
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

  const customAdminBackground = fondoAdminUrl.trim();

  return (
    <main
      className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      style={
        customAdminBackground
          ? {
              backgroundImage: `linear-gradient(rgba(20,10,6,0.55), rgba(20,10,6,0.55)), url("${customAdminBackground}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <a
          href="/"
          className="inline-block border border-amber-200/30 bg-black/25 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Volver al tablón
        </a>

        <a
          href="/admin/catalogo"
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Editar catálogo
        </a>

        <a
          href="/admin/historial"
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          style={{ textDecoration: "none" }}
        >
          Historial
        </a>

        <button
          type="button"
          onClick={() => setMostrarAjustes((prev) => !prev)}
          className="inline-block border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
        >
          Ajustes
        </button>
      </div>

      {mostrarAjustes ? (
        <form
          onSubmit={guardarAjustes}
          className="mb-8 border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
        >
          <h2
            className="text-3xl"
            style={{ fontFamily: "var(--font-almendra)" }}
          >
            Ajustes del Master
          </h2>

          <div className="mt-5 space-y-5">
            <DropzoneImagen
              label="Fondo de la portada principal"
              file={archivoFondoInicio}
              currentImageUrl={fondoInicioUrl}
              onFileChange={setArchivoFondoInicio}
            />

            <DropzoneImagen
              label="Fondo del panel del Master"
              file={archivoFondoAdmin}
              currentImageUrl={fondoAdminUrl}
              onFileChange={setArchivoFondoAdmin}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              className="border border-stone-900 bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.18em] text-amber-50"
            >
              Guardar ajustes
            </button>
            <button
              type="button"
              onClick={() => setMostrarAjustes(false)}
              className="border border-amber-950/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-900"
            >
              Cerrar
            </button>
          </div>
        </form>
      ) : null}

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

            <DropzoneImagen
              label="Imagen del personaje"
              file={archivoNuevo}
              currentImageUrl={null}
              onFileChange={setArchivoNuevo}
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

                  <DropzoneImagen
                    label="Imagen del personaje"
                    file={archivosEditar[perfil.id] ?? null}
                    currentImageUrl={editando[perfil.id]?.imagen_url ?? ""}
                    onFileChange={(file) =>
                      setArchivosEditar((prev) => ({
                        ...prev,
                        [perfil.id]: file,
                      }))
                    }
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
