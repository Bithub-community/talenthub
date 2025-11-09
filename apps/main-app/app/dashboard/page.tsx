import * as React from "react";
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

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, null),
    React.createElement(
      "main",
      { className: "container my-12 space-y-6" },
      React.createElement(
        "header",
        { className: "space-y-1" },
        React.createElement("h1", { className: "text-2xl font-semibold" }, "Yönetim Paneli"),
        React.createElement(
          "p",
          { className: "text-muted-foreground" },
          "Super-user kullanıcılar için davet oluşturma, log ve bildirim özetleri."
        )
      ),
      React.createElement(
        "div",
        { className: "grid gap-6 lg:grid-cols-[2fr_1fr]" },
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Davet Oluştur"),
            React.createElement(CardDescription, null, "Yeni başvuru veya inceleme daveti hazırlayın.")
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(InviteForm, null)
          )
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Son Davetler"),
            React.createElement(CardDescription, null, "En güncel 5 davet kaydı")
          ),
          React.createElement(
            CardContent,
            { className: "space-y-3 text-sm" },
            invites.length
              ? invites.map((invite) =>
                  React.createElement(
                    "div",
                    { key: invite.id, className: "rounded border p-3" },
                    React.createElement("div", { className: "font-medium" }, invite.type),
                    React.createElement("div", { className: "text-muted-foreground" }, invite.inviteJwtHash)
                  )
                )
              : React.createElement("p", { className: "text-muted-foreground" }, "Henüz davet yok.")
          )
        )
      ),
      React.createElement(
        "div",
        { className: "grid gap-6 lg:grid-cols-2" },
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Son Audit Loglar"),
            React.createElement(CardDescription, null, "Son 10 sistem olayı")
          ),
          React.createElement(
            CardContent,
            { className: "space-y-3 text-sm" },
            auditLogs.length
              ? auditLogs.map((log) =>
                  React.createElement(
                    "div",
                    { key: log.id, className: "rounded border p-3" },
                    React.createElement("div", { className: "font-medium" }, log.action),
                    React.createElement(
                      "div",
                      { className: "text-muted-foreground" },
                      new Date(log.createdAt).toLocaleString("tr-TR")
                    )
                  )
                )
              : React.createElement("p", { className: "text-muted-foreground" }, "Henüz log yok.")
          )
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Son Bildirimler"),
            React.createElement(CardDescription, null, "Son 5 bildirim")
          ),
          React.createElement(
            CardContent,
            { className: "space-y-3 text-sm" },
            notifications.length
              ? notifications.map((notif) =>
                  React.createElement(
                    "div",
                    { key: notif.id, className: "rounded border p-3" },
                    React.createElement("div", { className: "font-medium" }, notif.type),
                    React.createElement("div", { className: "text-muted-foreground" }, notif.title)
                  )
                )
              : React.createElement("p", { className: "text-muted-foreground" }, "Henüz bildirim yok.")
          )
        )
      )
    )
  );
}
