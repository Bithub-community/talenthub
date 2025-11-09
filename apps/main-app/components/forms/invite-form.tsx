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
import { DatePicker } from "@/components/ui/calendar";
import { predefinedSectors } from "@/lib/constants";
import { cn } from "@/lib/utils";
import React from "react";

const inviteSchema = z.object({
  createdById: z.string().uuid(),
  inviteeName: z.string().min(3),
  type: z.enum(["register_invite", "view_invite"]),
  scopes: z.string().min(1),
  filters: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
  adminToken: z.string().min(10)
});

export function InviteForm() {
  const [result, setResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      type: "register_invite",
      filters: []
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
      filters: values.filters ?? [],
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
        form.reset({ type: "register_invite", filters: [] });
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === "register_invite" ? "default" : "outline"}
                    onClick={() => field.onChange("register_invite")}
                    className="flex-1"
                  >
                    Başvuru
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "view_invite" ? "default" : "outline"}
                    onClick={() => field.onChange("view_invite")}
                    className="flex-1"
                  >
                    İnceleme
                  </Button>
                </div>
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
                <div className="flex flex-wrap gap-2">
                  {predefinedSectors.map((sector) => {
                    const isSelected = field.value?.includes(sector);
                    return (
                      <Button
                        key={sector}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const currentFilters = field.value ?? [];
                          if (isSelected) {
                            field.onChange(currentFilters.filter((s) => s !== sector));
                          } else {
                            field.onChange([...currentFilters, sector]);
                          }
                        }}
                        className={cn(
                          "transition-all",
                          isSelected && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        {sector}
                      </Button>
                    );
                  })}
                </div>
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
              <FormLabel>Geçerlilik Tarihi</FormLabel>
              <FormControl>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <DatePicker
                    value={field.value || undefined}
                    onChange={(date: String | null) =>
                      field.onChange(date ? date : null)
                    }
                    placeholder="Tarih seçin..."
                  />
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const d = new Date();
                        field.onChange(d.toISOString());
                      }}
                    >
                      Bugün
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        field.onChange(d.toISOString());
                      }}
                    >
                      +1 Gün
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        field.onChange(d.toISOString());
                      }}
                    >
                      +7 Gün
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 30);
                        field.onChange(d.toISOString());
                      }}
                    >
                      +30 Gün
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => field.onChange(null)}>
                      Temizle
                    </Button>
                  </div>
                </div>
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
