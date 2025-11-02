"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { predefinedSectors } from "@/lib/constants";

const formSchema = z.object({
  token: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  primarySector: z.string().optional(),
  sectors: z.string().array().optional(),
  motivation: z.string().optional(),
  cvUrl: z.string().url().optional(),
  motivationUrl: z.string().url().optional()
});

interface ApplicationFormProps {
  defaultToken?: string;
}

export function ApplicationForm({ defaultToken }: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: defaultToken ?? "",
      sectors: []
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setResult(null);

    const payload = {
      token: values.token,
      status: "submitted",
      primaryLocation: values.location,
      primarySectorId: values.primarySector ? Number(values.primarySector) : undefined,
      sectors: values.sectors?.map((sector) => Number(sector)) ?? [],
      personalInfo: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        location: values.location
      },
      documents: [
        values.cvUrl
          ? {
              docType: "cv",
              fileName: "cv",
              storageUrl: values.cvUrl,
              mimeType: "application/pdf",
              sizeBytes: 0
            }
          : null,
        values.motivationUrl
          ? {
              docType: "motivation_letter",
              fileName: "motivation",
              storageUrl: values.motivationUrl,
              mimeType: "application/pdf",
              sizeBytes: 0
            }
          : null
      ].filter(Boolean)
    };

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        setResult(`Başvuru oluşturulamadı: ${JSON.stringify(error)}`);
      } else {
        const json = await response.json();
        setResult(`Başvuru oluşturuldu. ID: ${json.id}`);
        form.reset();
      }
    } catch (error) {
      setResult(`Beklenmeyen hata: ${String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Başvuru Formu</CardTitle>
        <CardDescription>Yetkilendirme token&#39;ınızı kullanarak başvuru oluşturun.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasyon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primarySector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birincil Sektör</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        {...field}
                      >
                        <option value="">Seçiniz</option>
                        {predefinedSectors.map((sector, index) => (
                          <option key={sector} value={String(index + 1)}>
                            {sector}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sectors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İlgilendiğiniz Sektörler</FormLabel>
                    <FormControl>
                      <select
                        multiple
                        className="h-32 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={field.value}
                        onChange={(event) => {
                          const options = Array.from(event.target.selectedOptions).map(
                            (option) => option.value
                          );
                          field.onChange(options);
                        }}
                      >
                        {predefinedSectors.map((sector, index) => (
                          <option key={sector} value={String(index + 1)}>
                            {sector}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivasyon Notu</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="cvUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motivationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivasyon Mektubu (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Oluştur"}
            </Button>
          </form>
        </Form>
        {result && (
          <p className="text-sm text-muted-foreground" data-testid="result-message">
            {result}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
