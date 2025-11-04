import { Application } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, FileText, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

interface ApplicationSearchResultsProps {
  applications: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
}

export function ApplicationSearchResults({
  applications,
  pagination,
  onPageChange
}: ApplicationSearchResultsProps) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-2">
            <FileText className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Sonuç bulunamadı</h3>
          <p className="text-sm text-muted-foreground text-center">
            Arama kriterlerinize uygun başvuru bulunamadı.
            <br />Farklı kriterler deneyin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.totalCount} başvuru bulundu
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">
            Sayfa {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Sonraki
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => {
          const personalInfo = application.personalInfo;
          const firstName = personalInfo?.firstName || 'Bilinmeyen';
          const lastName = personalInfo?.lastName || 'Kişi';
          const email = personalInfo?.email || '';
          const phone = personalInfo?.phone || '';
          const location = application.primaryLocation || '';

          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(firstName, lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {firstName} {lastName}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {email}
                          </span>
                        )}
                        {phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {phone}
                          </span>
                        )}
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {application.sectors && application.sectors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Sektörler</p>
                      <div className="flex flex-wrap gap-1">
                        {application.sectors.map((sectorRelation: any) => (
                          <Badge key={sectorRelation.sector.id} variant="secondary" size="sm">
                            {sectorRelation.sector.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.documents && application.documents.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Belgeler</p>
                      <div className="flex gap-2">
                        {application.documents.map((doc: any) => (
                          <Badge key={doc.id} variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc.docType === 'cv' ? 'CV' : 'Motivasyon Mektubu'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button asChild size="sm">
                      <Link href={`/applications/${application.id}`}>
                        Detayları Gör
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}