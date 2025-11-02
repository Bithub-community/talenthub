import { ApplicationForm } from "@/components/forms/application-form";
import { Header } from "@/components/header";

interface NewApplicationPageProps {
  searchParams?: { token?: string };
}

export default function NewApplicationPage({ searchParams }: NewApplicationPageProps) {
  const token = searchParams?.token;
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