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
import { cn } from "@/lib/utils";

const formSchema = z.object({
  token: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  sectors: z
    .object({
      selected: z.array(z.string()).min(1, "En az bir sektör seçmelisiniz"),
      primary: z.string().min(1, "Birincil sektör seçmelisiniz")
    })
    .refine((data) => data.selected.includes(data.primary), {
      message: "Birincil sektör, seçilen sektörler arasında olmalıdır",
      path: ["primary"]
    }),
  motivation: z.string().optional(),
  cvUrl: z.string().url().optional(),
  motivationUrl: z.string().url().optional()
});

interface ApplicationFormProps {
  defaultToken?: string;
  defaultSelectedSectors?: string[];
  defaultPrimarySector?: string;
}

export function ApplicationForm({
  defaultToken,
  defaultSelectedSectors,
  defaultPrimarySector
}: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: defaultToken ?? "",
      // new combined sector fields
      selectedSectors: defaultSelectedSectors ? defaultSelectedSectors.map(String) : [],
      primarySector: defaultPrimarySector != null ? String(defaultPrimarySector) : undefined,
      // personal info and location defaults (used by the new payload structure)
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: ""
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
            <FormField
              control={form.control}
              name="selectedSectors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sektör Seçimi</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {predefinedSectors.map((sector, index) => {
                        const sectorValue = String(index + 1);
                        const isSelected = field.value?.includes(sectorValue);
                        return (
                          <Button
                            key={sector}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const currentSectors = field.value ?? [];
                              if (isSelected) {
                                field.onChange(currentSectors.filter((s) => s !== sectorValue));
                                // If this was the primary sector, clear it
                                if (form.getValues("primarySector") === sectorValue) {
                                  form.setValue("primarySector", "");
                                }
                              } else {
                                field.onChange([...currentSectors, sectorValue]);
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
