import { prisma } from "@/lib/prisma";
import { InviteForm } from "@/components/forms/invite-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audit Logları</CardTitle>
            <CardDescription>Son 10 işlem kaydı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {auditLogs.map((log) => (
              <div key={log.id.toString()} className="rounded border p-3">
                <div className="font-medium">{log.action}</div>
                <div className="text-muted-foreground">
                  {log.targetType} / {log.outcome}
                </div>
              </div>
            ))}
            {!auditLogs.length && <p className="text-muted-foreground">Kayıt yok.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bildirimler</CardTitle>
            <CardDescription>register-invite yetkili kullanıcı bildirimleri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded border p-3">
                <div className="font-medium">{notification.title}</div>
                <div className="text-muted-foreground">{notification.body}</div>
              </div>
            ))}
            {!notifications.length && <p className="text-muted-foreground">Bildirim yok.</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
