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
import { FileUpload } from "@/components/ui/file-upload";
import { predefinedSectors } from "@/lib/constants";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  token: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  sectors: z.array(z.string().nonempty()).min(1, "En az bir sektör seçmelisiniz"),
  motivation: z.string().optional(),
  cvFile: z
    .instanceof(File)
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
      message: "Dosya boyutu 10MB'den küçük olmalı"
    })
    .refine((file) => !file || ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(file.type), {
      message: "Sadece PDF, JPEG, PNG dosyaları kabul edilir"
    })
    .optional(),
  motivationFile: z
    .instanceof(File)
    .refine((file) => !file || file.size <= 10 * 1024 * 1024, {
      message: "Dosya boyutu 10MB'den küçük olmalı"
    })
    .refine((file) => !file || ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(file.type), {
      message: "Sadece PDF, JPEG, PNG dosyaları kabul edilir"
    })
    .optional()
});

interface ApplicationFormProps {
  defaultToken?: string;
  defaultSelectedSectors?: string[];
}

export function ApplicationForm({
  defaultToken,
  defaultSelectedSectors,
}: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: defaultToken ?? "",
      sectors: defaultSelectedSectors ? defaultSelectedSectors.map(String) : [],
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      motivation: "",
      cvFile: undefined,
      motivationFile: undefined
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setResult(null);

    try {
      // Upload files to MinIO if provided
      const uploadedDocuments: {
        docType: string;
        fileName: string;
        storageUrl: string;
        mimeType: string;
        sizeBytes: number;
      }[] = [];

      if (values.cvFile) {
        const formData = new FormData();
        formData.append("file", values.cvFile);

        const cvResponse = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        if (!cvResponse.ok) {
          // Try to read error details if available
          let errText = "CV dosyası yüklenemedi";
          try {
            const errJson = await cvResponse.json();
            errText += `: ${JSON.stringify(errJson)}`;
          } catch {
            errText += `: HTTP ${cvResponse.status}`;
          }
          throw new Error(errText);
        }

        const cvResult = await cvResponse.json();
        uploadedDocuments.push({
          docType: "cv",
          fileName: values.cvFile.name,
          storageUrl: cvResult.file?.storageUrl ?? cvResult.file?.storageUrl,
          mimeType: cvResult.file.mimeType,
          sizeBytes: cvResult.file.sizeBytes
        });
      }

      if (values.motivationFile) {
        const formData = new FormData();
        formData.append("file", values.motivationFile);

        const motivationResponse = await fetch("/api/uploads", {
          method: "POST",
          body: formData
        });

        if (!motivationResponse.ok) {
          throw new Error("Motivasyon mektubu dosyası yüklenemedi");
        }

        const motivationResult = await motivationResponse.json();
        uploadedDocuments.push({
          docType: "motivation_letter",
          fileName: values.motivationFile.name,
          storageUrl: motivationResult.file.storageUrl,
          mimeType: motivationResult.file.mimeType,
          sizeBytes: motivationResult.file.sizeBytes
        });
      }

      const payload = {
        token: values.token,
        status: "submitted",
        primaryLocation: values.location,
        sectors: values.sectors?.map((sector) => Number(sector)) ?? [],
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          location: values.location
        },
        documents: uploadedDocuments
      };

      try {
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          // Try to parse JSON error, fall back to text if parsing fails
          let errorBody;
          try {
            const errJson = await response.json();
            errorBody = JSON.stringify(errJson);
          } catch {
            errorBody = await response.text();
          }
          setResult(`Başvuru oluşturulamadı: ${errorBody}`);
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
                name="cvFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="CV dosyası seçin"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={10}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motivationFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivasyon Mektubu</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Motivasyon mektubu dosyası seçin"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={10}
                        disabled={isSubmitting}
                      />
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
