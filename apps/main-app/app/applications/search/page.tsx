import { Header } from '@/components/header';
import { SearchClient } from './search-client';
import React from 'react';

export default function ApplicationSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Başvuru Ara</h1>
        </div>

        <SearchClient
          initialApplications={[]}
          initialPagination={{
            page: 1,
            limit: 10,
            totalCount: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }}
        />
      </main>
    </div>
  );
}