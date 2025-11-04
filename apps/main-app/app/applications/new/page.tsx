import { ApplicationForm } from "@/components/forms/application-form";
import { Header } from "@/components/header";

interface NewApplicationPageProps {
  searchParams?: Promise<{ token?: string }>;
}

export default async function NewApplicationPage({ searchParams }: NewApplicationPageProps) {
  const params = await searchParams;
  const token = params?.token;
  return (
    <>
      <Header />
      <main className="container my-12 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Yeni Başvuru</h1>
          <p className="text-muted-foreground">
            Davet linkinizle gelen token&#39;ınızı girerek başvurunuzu oluşturun veya güncelleyin.
          </p>
        </div>
        <ApplicationForm defaultToken={token} />
      </main>
    </>
  );
}