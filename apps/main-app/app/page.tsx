import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/invite-init/demo-hash", label: "Invite Girişi" },
  { href: "/applications/new", label: "Başvuru Oluştur" },
  { href: "/dashboard", label: "Yönetim Paneli" }
];

export default function HomePage() {
  return (
    <main className="container my-16 space-y-8">
      <section className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Davet tabanlı güvenli başvuru yönetimi
        </h1>
        <p className="text-muted-foreground">
          Token bazlı yetkilendirme ile başvuru oluşturma, inceleme ve audit süreçlerini
          tek platformdan yönetin.
        </p>
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Button key={link.href} asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Davet Yönetimi",
            description: "Super-user kullanıcılar için davet oluşturma ve yönetim ekranları."
          },
          {
            title: "Başvuru Süreçleri",
            description: "Yetkili kullanıcıların CV, motivasyon mektubu ve belgelerini yüklemesi."
          },
          {
            title: "Audit & Bildirim",
            description: "Tüm hareketler audit loglarına yazılır ve ilgili bildirimler tetiklenir."
          }
        ].map(({ title, description }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tanımlı scope ve filtreler doğrultusunda güvenlik politikaları uygulanır.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
