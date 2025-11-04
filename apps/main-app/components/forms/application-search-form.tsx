'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { predefinedSectors } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface ApplicationSearchFormProps {
  onSearch: (params: { name: string; sectors: string[] }) => void;
  initialName?: string;
  initialSectors?: string[];
}

export function ApplicationSearchForm({ 
  onSearch, 
  initialName = '', 
  initialSectors = [] 
}: ApplicationSearchFormProps) {
  const [name, setName] = useState(initialName);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSectors);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ name, sectors: selectedSectors });
  };

  const toggleSector = (sectorId: string) => {
    setSelectedSectors(prev => 
      prev.includes(sectorId) 
        ? prev.filter(id => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const clearAll = () => {
    setName('');
    setSelectedSectors([]);
    onSearch({ name: '', sectors: [] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Başvuru Ara</span>
          {(name || selectedSectors.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Temizle
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">İsim veya E-posta</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="name"
                placeholder="İsim, soyisim veya e-posta ara..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sektörler</Label>
            <div className="flex flex-wrap gap-2">
              {predefinedSectors.map((sector, index) => {
                const sectorId = String(index + 1);
                const isSelected = selectedSectors.includes(sectorId);
                
                return (
                  <Button
                    key={sector}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSector(sectorId)}
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
          </div>

          <Button type="submit" className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Ara
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}