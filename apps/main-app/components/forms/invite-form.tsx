"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const inviteSchema = z.object({
  createdById: z.string().uuid(),
  inviteeName: z.string().min(3),
  type: z.enum(["register_invite", "view_invite"]),
  scopes: z.string().min(1),
  filters: z.string().optional(),
  expiresAt: z.string().optional(),
  adminToken: z.string().min(10)
});

export function InviteForm() {
  const [result, setResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      type: "register_invite"
    }
  });

  async function onSubmit(values: z.infer<typeof inviteSchema>) {
    setIsSubmitting(true);
    setResult(null);

    const { adminToken, ...data } = values;

    const payload = {
      createdById: values.createdById,
      inviteeName: values.inviteeName,
      type: values.type,
      scopes: values.scopes.split(/[,\s]+/).filter(Boolean),
      filters: values.filters?.split(/[,\s]+/).filter(Boolean) ?? [],
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null
    };

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, adminToken })
      });

      if (!response.ok) {
        const error = await response.json();
        setResult(`Hata: ${JSON.stringify(error)}`);
      } else {
        const invite = await response.json();
        setResult(`Davet oluşturuldu. Hash: ${invite.inviteJwtHash}`);
        form.reset({ type: "register_invite" });
      }
    } catch (error) {
      setResult(`Beklenmeyen hata: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="createdById"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Super-user ID</FormLabel>
              <FormControl>
                <Input placeholder="UUID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="inviteeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Davetli Adı</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Davet Tipi</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...field}
                >
                  <option value="register_invite">Başvuru</option>
                  <option value="view_invite">İnceleme</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scopes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope listesi</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="register-invite view-invite" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="filters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Filtre listesi</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="sector1 sector2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geçerlilik (ISO tarih)</FormLabel>
              <FormControl>
                <Input placeholder="2024-12-31T20:00:00.000Z" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin JWT</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Oluşturuluyor..." : "Davet Oluştur"}
        </Button>
        {result && <p className="text-sm text-muted-foreground">{result}</p>}
      </form>
    </Form>
  );
}
