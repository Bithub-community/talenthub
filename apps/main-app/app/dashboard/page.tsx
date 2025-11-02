import { prisma } from "@/lib/prisma";
import { InviteForm } from "@/components/forms/invite-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";

export default async function DashboardPage() {
  const [invites, auditLogs, notifications] = await Promise.all([
    prisma.invite.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return (
    <>
      <Header />
      <main className="container my-12 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Yönetim Paneli</h1>
          <p className="text-muted-foreground">
            Super-user kullanıcılar için davet oluşturma, log ve bildirim özetleri.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Davet Oluştur</CardTitle>
              <CardDescription>Yeni başvuru veya inceleme daveti hazırlayın.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Son Davetler</CardTitle>
              <CardDescription>En güncel 5 davet kaydı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {invites.map((invite) => (
                <div key={invite.id} className="rounded border p-3">
                  <div className="font-medium">{invite.type}</div>
                  <div className="text-muted-foreground">{invite.inviteJwtHash}</div>
                </div>
              ))}
              {!invites.length && <p className="text-muted-foreground">Henüz davet yok.</p>}
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Son Audit Loglar</CardTitle>
              <CardDescription>Son 10 sistem olayı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded border p-3">
                  <div className="font-medium">{log.action}</div>
                  <div className="text-muted-foreground">{new Date(log.createdAt).toLocaleString("tr-TR")}</div>
                </div>
              ))}
              {!auditLogs.length && <p className="text-muted-foreground">Henüz log yok.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Son Bildirimler</CardTitle>
              <CardDescription>Son 5 bildirim</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {notifications.map((notif) => (
                <div key={notif.id} className="rounded border p-3">
                  <div className="font-medium">{notif.type}</div>
                  <div className="text-muted-foreground">{notif.message}</div>
                </div>
              ))}
              {!notifications.length && <p className="text-muted-foreground">Henüz bildirim yok.</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
