import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

interface ApplicationDetailPageProps {
  params: { id: string };
  searchParams?: { token?: string };
}

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function fetchApplication(id: string, token: string) {
  const response = await fetch(`${baseUrl}/api/applications/${id}?token=${encodeURIComponent(token)}`, {
    cache: "no-store"
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch application: ${await response.text()}`);
  }
  return response.json();
}

export default async function ApplicationDetailPage({ params, searchParams }: ApplicationDetailPageProps) {
  const token = searchParams?.token;

  if (!token) {
    return (
      <>
        <Header />
        <main className="container my-16 max-w-3xl space-y-4">
          <h1 className="text-2xl font-semibold">Token gerekli</h1>
          <p className="text-muted-foreground">
            Başvuru detaylarını görüntülemek için davet token&#39;ınızı URL parametresi olarak ekleyin.
          </p>
        </main>
      </>
    );
  }

  const application = await fetchApplication(params.id, token);

  if (!application) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="container my-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Başvuru Detayı</h1>
            <p className="text-muted-foreground">{application.personalInfo?.firstName} {application.personalInfo?.lastName}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Yönetim</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>Başvuru sahibinin iletişim detayları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><span className="font-medium">E-posta:</span> {application.personalInfo?.email}</p>
              <p><span className="font-medium">Telefon:</span> {application.personalInfo?.phone ?? "-"}</p>
              <p><span className="font-medium">Lokasyon:</span> {application.primaryLocation ?? "-"}</p>
              <p><span className="font-medium">Durum:</span> {application.status}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sektörler</CardTitle>
              <CardDescription>Token ile uyumlu sektörler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {application.sectors?.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {application.sectors.map((item: any) => (
                    <li key={item.id}>{item.sector?.name ?? `Sektör #${item.sectorId}`}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Sektör bilgisi yok.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Belgeler</CardTitle>
            <CardDescription>İmzalı URL üzerinden indirilebilir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {application.documents?.length ? (
              <ul className="space-y-2">
                {application.documents.map((doc: any) => (
                  <li key={doc.id} className="flex items-center justify-between rounded border bg-muted/30 p-3">
                    <span className="font-medium">{doc.docType}</span>
                    <a
                      className="text-primary underline"
                      href={doc.storageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Görüntüle
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Henüz belge yüklenmemiş.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
