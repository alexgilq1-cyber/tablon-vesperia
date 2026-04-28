"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ImageDropzone } from "@/components/image-dropzone";
import type { CatalogItem, Profile } from "@/types/domain";

type CouncilDashboardProps = {
  profiles: Profile[];
  catalog: CatalogItem[];
  storageBucket: string;
  isConfigured: boolean;
};

type Flash = {
  tone: "error" | "success";
  text: string;
};

const emptyProfileForm = {
  nombre: "",
  puntos_esencia: "0",
};

const emptyCatalogForm = {
  titulo: "",
  descripcion: "",
  coste: "0",
  categoria: "",
};

export function CouncilDashboard({
  profiles,
  catalog,
  storageBucket,
  isConfigured,
}: CouncilDashboardProps) {
  const router = useRouter();
  const [flash, setFlash] = useState<Flash | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [catalogForm, setCatalogForm] = useState(emptyCatalogForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === editingProfileId) ?? null,
    [editingProfileId, profiles],
  );

  async function uploadAvatar() {
    if (!avatarFile) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", avatarFile);

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

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("profile");
    setFlash(null);

    try {
      const imagen_url = await uploadAvatar();
      const payload = {
        nombre: profileForm.nombre,
        puntos_esencia: Number(profileForm.puntos_esencia),
        imagen_url: imagen_url ?? activeProfile?.imagen_url ?? null,
      };

      const response = await fetch(
        editingProfileId ? `/api/profiles/${editingProfileId}` : "/api/profiles",
        {
          method: editingProfileId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "No se pudo guardar el perfil.");
      }

      setFlash({
        tone: "success",
        text: editingProfileId ? "Perfil actualizado." : "Perfil creado.",
      });
      setProfileForm(emptyProfileForm);
      setAvatarFile(null);
      setEditingProfileId(null);
      router.refresh();
    } catch (error) {
      setFlash({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el perfil.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleCatalogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("catalog");
    setFlash(null);

    try {
      const response = await fetch(editingItemId ? `/api/catalog/${editingItemId}` : "/api/catalog", {
        method: editingItemId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: catalogForm.titulo,
          descripcion: catalogForm.descripcion,
          coste: Number(catalogForm.coste),
          categoria: catalogForm.categoria,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "No se pudo guardar el anuncio.");
      }

      setFlash({
        tone: "success",
        text: editingItemId ? "Anuncio actualizado." : "Anuncio anadido al mercado.",
      });
      setCatalogForm(emptyCatalogForm);
      setEditingItemId(null);
      router.refresh();
    } catch (error) {
      setFlash({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo guardar el anuncio.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function removeProfile(profileId: string) {
    setBusy(`delete-profile-${profileId}`);
    setFlash(null);

    try {
      const response = await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo borrar el perfil.");
      }

      setFlash({ tone: "success", text: "Perfil eliminado." });
      router.refresh();
    } catch (error) {
      setFlash({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo borrar el perfil.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function removeCatalogItem(itemId: string) {
    setBusy(`delete-item-${itemId}`);
    setFlash(null);

    try {
      const response = await fetch(`/api/catalog/${itemId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo borrar el anuncio.");
      }

      setFlash({ tone: "success", text: "Anuncio eliminado." });
      router.refresh();
    } catch (error) {
      setFlash({
        tone: "error",
        text: error instanceof Error ? error.message : "No se pudo borrar el anuncio.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleLogout() {
    setBusy("logout");
    await fetch("/api/master/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10">
      <section className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(83,36,24,0.94),rgba(36,17,13,0.98))] p-6 text-amber-50 shadow-[0_25px_50px_rgba(0,0,0,0.38)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-[family:var(--font-medieval)] text-sm uppercase tracking-[0.28em] text-amber-200/80">
              Sala reservada
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-5xl leading-none text-amber-50">
              Consejo de Vesperia
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-100/78">
              Desde aqui puedes vigilar los perfiles, renovar el Mercado del Merito y supervisar a cada
              jugador.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="border border-amber-100/25 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.2em] text-amber-100/80">
              Bucket: {storageBucket}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="border border-amber-100/30 px-4 py-3 text-xs uppercase tracking-[0.2em] transition hover:bg-amber-50/10"
            >
              {busy === "logout" ? "Cerrando..." : "Cerrar sello"}
            </button>
          </div>
        </div>
      </section>

      {!isConfigured ? (
        <section className="mt-6 border border-amber-700/35 bg-amber-100/80 px-5 py-4 text-stone-900 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
          <p className="font-[family:var(--font-medieval)] uppercase tracking-[0.18em] text-amber-950">
            Modo de muestra activo
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-800/80">
            Las herramientas administrativas requieren una conexion real a Supabase y una clave maestra en
            entorno. La UI ya esta lista; falta enlazarla con tus credenciales.
          </p>
        </section>
      ) : null}

      {flash ? (
        <section
          className={`mt-6 border px-4 py-3 text-sm shadow-[0_10px_24px_rgba(0,0,0,0.18)] ${flash.tone === "success" ? "border-emerald-900/25 bg-emerald-100/80 text-emerald-950" : "border-red-900/25 bg-red-100/80 text-red-950"}`}
        >
          {flash.text}
        </section>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={handleProfileSubmit}
          className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.96),rgba(228,204,149,0.98))] p-6 text-stone-900 shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
        >
          <p className="font-[family:var(--font-medieval)] text-sm uppercase tracking-[0.28em] text-amber-950/80">
            Registro de jugadores
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-4xl leading-none">
            {editingProfileId ? "Editar perfil" : "Crear perfil"}
          </h2>

          <div className="mt-6 grid gap-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">Nombre del personaje</span>
              <input
                value={profileForm.nombre}
                onChange={(event) => setProfileForm((current) => ({ ...current, nombre: event.target.value }))}
                className="w-full border border-amber-950/30 bg-white/70 px-4 py-3 outline-none focus:border-amber-900"
                placeholder="Nombre del aventurero"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">Puntos de Esencia</span>
              <input
                type="number"
                value={profileForm.puntos_esencia}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, puntos_esencia: event.target.value }))
                }
                className="w-full border border-amber-950/30 bg-white/70 px-4 py-3 outline-none focus:border-amber-900"
              />
            </label>
            <ImageDropzone
              label="Retrato del personaje"
              file={avatarFile}
              currentImageUrl={activeProfile?.imagen_url ?? null}
              onFileChange={setAvatarFile}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!isConfigured || busy === "profile"}
              className="border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50 transition hover:bg-stone-800 disabled:opacity-60"
            >
              {busy === "profile" ? "Guardando..." : editingProfileId ? "Actualizar perfil" : "Crear perfil"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingProfileId(null);
                setProfileForm(emptyProfileForm);
                setAvatarFile(null);
              }}
              className="border border-amber-950/35 px-4 py-3 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900/5"
            >
              Limpiar
            </button>
          </div>
        </form>

        <form
          onSubmit={handleCatalogSubmit}
          className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.96),rgba(228,204,149,0.98))] p-6 text-stone-900 shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
        >
          <p className="font-[family:var(--font-medieval)] text-sm uppercase tracking-[0.28em] text-amber-950/80">
            Mercado del Merito
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-4xl leading-none">
            {editingItemId ? "Editar anuncio" : "Anadir anuncio"}
          </h2>

          <div className="mt-6 grid gap-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">Titulo</span>
              <input
                value={catalogForm.titulo}
                onChange={(event) => setCatalogForm((current) => ({ ...current, titulo: event.target.value }))}
                className="w-full border border-amber-950/30 bg-white/70 px-4 py-3 outline-none focus:border-amber-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">Descripcion</span>
              <textarea
                value={catalogForm.descripcion}
                onChange={(event) =>
                  setCatalogForm((current) => ({ ...current, descripcion: event.target.value }))
                }
                rows={4}
                className="w-full border border-amber-950/30 bg-white/70 px-4 py-3 outline-none focus:border-amber-900"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">Coste en PE</span>
                <input
                  type="number"
                  value={catalogForm.coste}
                  onChange={(event) => setCatalogForm((current) => ({ ...current, coste: event.target.value }))}
                  className="w-full border border-amber-950/30 bg-white/70 px-4 py-3 outline-none focus:border-amber-900"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">Categoria</span>
                <input
                  value={catalogForm.categoria}
                  onChange={(event) =>
                    setCatalogForm((current) => ({ ...current, categoria: event.target.value }))
                  }
                  className="w-full border border-amber-950/30 bg-white/70 px-4 py-3 outline-none focus:border-amber-900"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!isConfigured || busy === "catalog"}
              className="border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.18em] text-amber-50 transition hover:bg-stone-800 disabled:opacity-60"
            >
              {busy === "catalog" ? "Guardando..." : editingItemId ? "Actualizar anuncio" : "Publicar anuncio"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingItemId(null);
                setCatalogForm(emptyCatalogForm);
              }}
              className="border border-amber-950/35 px-4 py-3 text-sm uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900/5"
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.96),rgba(228,204,149,0.98))] p-6 text-stone-900 shadow-[0_25px_50px_rgba(0,0,0,0.35)]">
          <p className="font-[family:var(--font-medieval)] text-sm uppercase tracking-[0.28em] text-amber-950/80">
            Pergaminos activos
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-4xl leading-none">Jugadores</h2>

          <div className="mt-6 grid gap-4">
            {profiles.map((profile, index) => (
              <article
                key={profile.id}
                className={`border border-amber-950/25 bg-white/45 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] ${index % 2 === 0 ? "rotate-[-0.4deg]" : "rotate-[0.4deg]"}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden border-[3px] border-amber-950/45 bg-[radial-gradient(circle_at_30%_30%,#f6ead1,#d0b07b_58%,#8f6539)]">
                      {profile.imagen_url ? (
                        <Image
                          src={profile.imagen_url}
                          alt={profile.nombre}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-[family:var(--font-display)] text-3xl text-stone-800/70">
                          {profile.nombre.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-[family:var(--font-display)] text-3xl leading-none">{profile.nombre}</h3>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-800/68">
                        {profile.puntos_esencia} PE disponibles
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfileId(profile.id);
                        setProfileForm({
                          nombre: profile.nombre,
                          puntos_esencia: String(profile.puntos_esencia),
                        });
                      }}
                      className="border border-amber-950/35 px-3 py-2 text-xs uppercase tracking-[0.18em] transition hover:bg-stone-900/5"
                    >
                      Editar
                    </button>
                    <Link
                      href={`/jugador/${profile.id}`}
                      className="border border-amber-950/35 px-3 py-2 text-xs uppercase tracking-[0.18em] transition hover:bg-stone-900/5"
                    >
                      Supervisar
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeProfile(profile.id)}
                      disabled={!isConfigured || busy === `delete-profile-${profile.id}`}
                      className="border border-red-950/35 px-3 py-2 text-xs uppercase tracking-[0.18em] text-red-900 transition hover:bg-red-950/6 disabled:opacity-60"
                    >
                      {busy === `delete-profile-${profile.id}` ? "Borrando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border border-amber-950/45 bg-[linear-gradient(180deg,rgba(248,237,206,0.96),rgba(228,204,149,0.98))] p-6 text-stone-900 shadow-[0_25px_50px_rgba(0,0,0,0.35)]">
          <p className="font-[family:var(--font-medieval)] text-sm uppercase tracking-[0.28em] text-amber-950/80">
            Archivo del mercado
          </p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-4xl leading-none">Objetos y favores</h2>

          <div className="mt-6 grid gap-4">
            {catalog.map((item, index) => (
              <article
                key={item.id}
                className={`border border-amber-950/25 bg-white/45 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.12)] ${index % 2 === 0 ? "rotate-[0.3deg]" : "rotate-[-0.3deg]"}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-800/68">{item.categoria}</p>
                    <h3 className="mt-2 font-[family:var(--font-display)] text-3xl leading-none">{item.titulo}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-800/78">{item.descripcion}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="border border-amber-950/30 bg-amber-100/60 px-3 py-2 text-xs uppercase tracking-[0.18em] text-stone-900">
                      {item.coste} PE
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemId(item.id);
                        setCatalogForm({
                          titulo: item.titulo,
                          descripcion: item.descripcion,
                          coste: String(item.coste),
                          categoria: item.categoria,
                        });
                      }}
                      className="border border-amber-950/35 px-3 py-2 text-xs uppercase tracking-[0.18em] transition hover:bg-stone-900/5"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCatalogItem(item.id)}
                      disabled={!isConfigured || busy === `delete-item-${item.id}`}
                      className="border border-red-950/35 px-3 py-2 text-xs uppercase tracking-[0.18em] text-red-900 transition hover:bg-red-950/6 disabled:opacity-60"
                    >
                      {busy === `delete-item-${item.id}` ? "Borrando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
