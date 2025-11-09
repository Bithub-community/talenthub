import { notFound } from "next/navigation";
import { getInviteByHash } from "@/lib/invites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/header";
import React from "react";

interface InviteInitPageProps {
  params: { hash: string };
}

export default async function InviteInitPage({ params }: InviteInitPageProps) {
  const invite = await getInviteByHash(params.hash);

  if (!invite) {
    notFound();
  }

  const applicationLink = invite.rawJwt
    ? { pathname: "/applications/new", query: { token: invite.rawJwt } }
    : "/applications/new";

  return (
    <>
      <Header />
      <main className="container my-16 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Davet doğrulandı</CardTitle>
            <CardDescription>
              Davet tipiniz: <span className="font-medium">{invite.type}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <p className="text-sm text-muted-foreground">
                Token&#39;ınız güvenli şekilde saklanır. Başvuru oluşturmak için aşağıdaki linki
                kullanabilirsiniz.
              </p>
            </section>
            <section className="rounded-md border bg-muted/30 p-4 text-sm">
              <p className="font-mono break-words" data-testid="invite-token">
                {invite.rawJwt ?? "Token oluşturuluyor"}
              </p>
            </section>
            <div className="flex flex-wrap gap-3">
              <Button asChild disabled={!invite.rawJwt}>
                <Link href={applicationLink}>Başvuruya Başla</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Yönetim Paneline Dön</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
