import PublicationDetail from "@/components/PublicationDetail";
import RegisterHelp from "@/components/RegisterHelp";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const id = sp.id ? String(sp.id) : null;
  const idNum = id ? parseInt(id, 10) : NaN;

  if (!id || isNaN(idNum)) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200">
          <p className="text-red-600 font-medium">
            ID de publicación no válido
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <RegisterHelp
        steps={[
          {
            title: "Detalle de la publicación",
            content: (
              <div>
                <p>Aquí ves la descripción completa, requisitos y contacto.</p>
                <p>Si deseas postular, busca el botón "Postular" dentro de la ficha.</p>
              </div>
            ),
          },
        ]}
      />
      <PublicationDetail id={idNum} />
    </main>
  );
}
