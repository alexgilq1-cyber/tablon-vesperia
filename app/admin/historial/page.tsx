"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: string;
  nombre: string;
};

type ItemCatalogo = {
  id: string;
  titulo: string;
  categoria: string;
  localizacion: string | null;
  imagen_url: string | null;
  coste: number;
};

type Transaccion = {
  id: string;
  perfil_id: string;
  item_id: string | null;
  fecha: string;
  consumido: boolean;
  consumido_en: string | null;
};

type HistorialRow = {
  id: string;
  jugador: string;
  item: string;
  categoria: string;
  localizacion: string | null;
  coste: number;
  imagen_url: string | null;
  fecha: string;
  consumido: boolean;
  consumido_en: string | null;
};

const categorias = [
  "Todas",
  "Armas",
  "Scrolls",
  "Permisos",
  "Pociones",
  "Reliquias",
  "Objetos mágicos",
  "Otros",
];

const localizaciones = [
  "Todas",
  "Protectorado de Pira",
  "Unión del Hielo",
  "Reino de Oakhaven",
  "Baronía de Hierro",
  "Confed. Río Plata",
  "Teocracia del Monolito",
  "Liga de la Planicie",
  "Enclave de Puerto Gris",
];

export default function AdminHistorialPage() {
  const [historial, setHistorial] = useState<HistorialRow[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroLocalizacion, setFiltroLocalizacion] = useState("Todas");
  const [cargando, setCargando] = useState(true);

  async function cargarHistorial() {
    setCargando(true);
    setMensaje("");

    const { data: transaccionesData, error: transaccionesError } = await supabase
      .from("transacciones")
      .select("id, perfil_id, item_id, fecha, consumido, consumido_en")
      .order("fecha", { ascending: false });

    if (transaccionesError) {
      setMensaje(`No se pudo cargar el historial: ${transaccionesError.message}`);
      setCargando(false);
      return;
    }

    const transacciones = (transaccionesData ?? []) as Transaccion[];

    if (transacciones.length === 0) {
      setHistorial([]);
      setCargando(false);
      return;
    }

    const perfilIds = [
      ...new Set(
        transacciones
          .map((t) => t.perfil_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const itemIds = [
      ...new Set(
        transacciones
          .map((t) => t.item_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const { data: perfilesData, error: perfilesError } = await supabase
      .from("perfiles")
      .select("id, nombre")
      .in("id", perfilIds);

    if (perfilesError) {
      setMensaje(`No se pudieron cargar los perfiles: ${perfilesError.message}`);
      setCargando(false);
      return;
    }

    let items: ItemCatalogo[] = [];

    if (itemIds.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from("catalogo")
        .select("id, titulo, categoria, localizacion, imagen_url, coste")
        .in("id", itemIds);

      if (itemsError) {
        setMensaje(`No se pudieron cargar los objetos: ${itemsError.message}`);
        setCargando(false);
        return;
      }

      items = (itemsData ?? []) as ItemCatalogo[];
    }

    const perfiles = (perfilesData ?? []) as Perfil[];

    const mapaPerfiles = new Map(perfiles.map((p) => [p.id, p.nombre]));
    const mapaItems = new Map(items.map((i) => [i.id, i]));

    const filas: HistorialRow[] = transacciones.map((t) => {
      const item = t.item_id ? mapaItems.get(t.item_id) : null;

      return {
        id: t.id,
        jugador: mapaPerfiles.get(t.perfil_id) ?? "Desconocido",
        item: item?.titulo ?? "Objeto eliminado",
        categoria: item?.categoria ?? "Otros",
        localizacion: item?.localizacion ?? null,
        coste: item?.coste ?? 0,
        imagen_url: item?.imagen_url ?? null,
        fecha: t.fecha,
        consumido: t.consumido,
        consumido_en: t.consumido_en,
      };
    });

    setHistorial(filas);
    setCargando(false);
  }

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function borrarRegistro(id: string) {
    setMensaje("");

    const confirmacion = window.confirm(
      "¿Seguro que quieres borrar este registro del historial?"
    );

    if (!confirmacion) return;

    const { error } = await supabase.from("transacciones").delete().eq("id", id);

    if (error) {
      setMensaje(`No se pudo borrar el registro: ${error.message}`);
      return;
    }

    setMensaje("Registro eliminado.");
    await cargarHistorial();
  }

  async function borrarTodoHistorial() {
    setMensaje("");

    const confirmacion = window.confirm(
      "¿Seguro que quieres borrar TODO el historial?"
    );

    if (!confirmacion) return;

    const { error } = await supabase
      .from("transacciones")
      .delete()
      .not("id", "is", null);

    if (error) {
      setMensaje(`No se pudo borrar el historial: ${error.message}`);
      return;
    }

    setMensaje("Historial completo eliminado.");
    await cargarHistorial();
  }

  const historialFiltrado = useMemo(() => {
    return historial.filter((fila) => {
      const okCategoria =
        filtroCategoria === "Todas" || fila.categoria === filtroCategoria;

      const okLocalizacion =
        filtroLocalizacion === "Todas" ||
        (fila.localizacion ?? "") === filtroLocalizacion;

      return okCategoria && okLocalizacion;
    });
  }, [historial, filtroCategoria, filtroLocalizacion]);

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

        <button
          type="button"
          onClick={borrarTodoHistorial}
          className="border border-red-900/40 px-4 py-3 text-sm uppercase tracking-[0.18em] text-red-900 bg-white/70"
        >
          Borrar todo el historial
        </button>
      </div>

      <section className="border border-amber-950/45 bg-black/30 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
        <p
          className="text-sm uppercase tracking-[0.35em] text-amber-300/75"
          style={{ fontFamily: "var(--font-medieval)" }}
        >
          Registro del reino
        </p>

        <h1
          className="mt-3 text-5xl leading-none text-amber-50"
          style={{ fontFamily: "var(--font-almendra)" }}
        >
          Historial de canjeos
        </h1>

        <p className="mt-4 max-w-2xl text-amber-100/85">
          Aquí puedes ver todas las compras del reino, aunque el objeto ya se
          haya gastado o retirado del inventario.
        </p>
      </section>

      <section className="mt-8 border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-6 text-stone-900 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full border border-amber-950/30 bg-white/85 px-4 py-3 text-stone-900 outline-none"
          >
            {categorias.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>

          <select
            value={filtroLocalizacion}
            onChange={(e) => setFiltroLocalizacion(e.target.value)}
            className="w-full border border-amber-950/30 bg-white/85 px-4 py-3 text-stone-900 outline-none"
          >
            {localizaciones.map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {mensaje ? <p className="text-amber-100">{mensaje}</p> : null}

        {cargando ? <p className="text-amber-100">Cargando historial...</p> : null}

        {!cargando &&
          historialFiltrado.map((fila) => (
            <article
              key={fila.id}
              className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-4 text-stone-900 shadow-[0_12px_28px_rgba(0,0,0,0.28)]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className="h-20 w-20 overflow-hidden border-[3px] border-amber-950/35 bg-amber-200">
                    {fila.imagen_url ? (
                      <img
                        src={fila.imagen_url}
                        alt={fila.item}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-stone-700">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-950/75">
                      {fila.categoria}
                    </p>

                    {fila.localizacion ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-700/75">
                        {fila.localizacion}
                      </p>
                    ) : null}

                    <h2
                      className="mt-1 text-3xl leading-none"
                      style={{ fontFamily: "var(--font-almendra)" }}
                    >
                      {fila.item}
                    </h2>

                    <p className="mt-2 text-sm text-stone-800/80">
                      Jugador: <strong>{fila.jugador}</strong>
                    </p>

                    <p className="mt-1 text-sm text-stone-800/80">
                      Coste: <strong>{fila.coste} PE</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <div className="text-sm text-stone-800/80">
                    <p>
                      Compra:{" "}
                      {new Date(fila.fecha).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    <p className="mt-2">
                      Estado:{" "}
                      <strong>{fila.consumido ? "Gastado" : "En inventario"}</strong>
                    </p>

                    {fila.consumido && fila.consumido_en ? (
                      <p className="mt-1">
                        Gastado el{" "}
                        {new Date(fila.consumido_en).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => borrarRegistro(fila.id)}
                    className="border border-red-900/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-red-900 bg-white/70"
                  >
                    Borrar registro
                  </button>
                </div>
              </div>
            </article>
          ))}

        {!cargando && historialFiltrado.length === 0 ? (
          <p className="text-amber-100">No hay registros para esos filtros.</p>
        ) : null}
      </section>
    </main>
  );
}
