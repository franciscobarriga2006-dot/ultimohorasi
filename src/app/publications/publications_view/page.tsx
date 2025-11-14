// app/publicaciones/page.tsx
import FilterBar from "@/components/PublicationsViewFilterbar";
import PublicationCard from "@/components/PublicationCard";
import RegisterHelp from "@/components/RegisterHelp";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* FilterBar con z-index superior */}
      <div className="relative z-25 mb-8">
        <FilterBar/>
      </div>

      {/* Todas las publicaciones (Necesidades y Servicios) */}
      <section className="relative z-10 space-y-4">
        <h2 className="text-xl font-semibold">Publicaciones</h2>
        <PublicationCard searchParams={sp} />
      </section>
      <RegisterHelp
        steps={[
          {
            title: "Explora las publicaciones disponibles",
            content: (
              <div>
                <p>Aquí encontrarás las publicaciones más recientes de trabajo y servicios disponibles en la plataforma.</p>
                <p style={{ marginTop: 12 }}>Usa los filtros superiores para encontrar exactamente lo que buscas: puedes filtrar por palabra clave, ciudad o estado del trabajo.</p>
                <p style={{ marginTop: 12 }}>En cada publicación verás los detalles principales y podrás acceder a más información o postular directamente.</p>
              </div>
            ),
          },
          {
            title: "Trabajos y Servicios",
            content: (
              <div>
                <p>Las publicaciones están separadas en dos secciones:</p>
                <ul style={{ marginTop: 12, marginLeft: 20 }}>
                  <li>Publicaciones de trabajo: oportunidades laborales puntuales o específicas</li>
                  <li style={{ marginTop: 8 }}>Servicios: ofertas de servicios profesionales continuos</li>
                </ul>
                <p style={{ marginTop: 12 }}>Pulsa en cualquier publicación para ver todos los detalles y requisitos.</p>
              </div>
            ),
          }
        ]}
      />
    </main>
  );
}