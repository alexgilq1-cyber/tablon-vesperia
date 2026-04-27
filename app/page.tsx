import Link from "next/link";

const jugadores = [
  {
    id: "aria-del-bosque",
    nombre: "Aria del Bosque",
    imagen:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    pe: 18,
    rotacion: "-2deg",
  },
  {
    id: "darian-cuervo",
    nombre: "Darian Cuervo",
    imagen:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    pe: 11,
    rotacion: "1.5deg",
  },
  {
    id: "selene-bruma",
    nombre: "Selene Bruma",
    imagen:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
    pe: 25,
    rotacion: "-1deg",
  },
];

function PergaminoJugador({
  id,
  nombre,
  imagen,
  pe,
  rotacion,
}: {
  id: string;
  nombre: string;
  imagen: string;
  pe: number;
  rotacion: string;
}) {
  return (
    <Link
      href={`/jugador/${id}`}
      style={{
        transform: `rotate(${rotacion})`,
        textDecoration: "none",
        color: "#22150f",
      }}
      className="block border border-amber-900/40 bg-[linear-gradient(180deg,rgba(248,237,206,0.97),rgba(228,204,149,0.99))] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-1"
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 overflow-hidden border-[3px] border-amber-950/40 bg-amber-200 shadow-inner">
          <img
            src={imagen}
            alt={nombre}
            className="h-full w-full object-cover"
          />
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
            {nombre}
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.18em] text-stone-800/75">
            {pe} PE disponibles
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="border border-amber-900/40 bg-black/30 p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-[1px]">
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
          href="/admin"
          className="relative block overflow-hidden border border-red-950/70 bg-[linear-gradient(180deg,rgba(238,222,176,0.96),rgba(211,172,110,0.99))] p-5 text-stone-900 shadow-[0_20px_40px_rgba(0,0,0,0.38)] transition hover:-translate-y-1 hover:rotate-[-1deg]"
          style={{ textDecoration: "none" }}
        >
          <div className="absolute right-5 top-5 h-14 w-14 rounded-full border-4 border-red-900/60 bg-[radial-gradient(circle_at_30%_30%,#f8b0b0,#a1121d_60%,#5d0810)]" />

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

        {jugadores.map((jugador) => (
          <PergaminoJugador key={jugador.id} {...jugador} />
        ))}
      </section>
    </main>
  );
}
