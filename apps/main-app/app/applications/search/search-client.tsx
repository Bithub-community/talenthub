'use client';

import { useState, useEffect } from 'react';
import { ApplicationSearchForm } from '@/components/forms/application-search-form';
import { ApplicationSearchResults } from '@/components/application-search-results';
import React from 'react';

interface SearchClientProps {
  initialApplications: any[];
  initialPagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function SearchClient({ initialApplications, initialPagination }: SearchClientProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({ name: '', sectors: [] as string[] });

  const performSearch = async (params: { name: string; sectors: string[] }, page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params.name) queryParams.set('name', params.name);
      if (params.sectors.length > 0) queryParams.set('sectors', params.sectors.join(','));
      queryParams.set('page', page.toString());
      queryParams.set('limit', '10');

      const response = await fetch(`/api/applications/search?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        setPagination(data.pagination);
        setSearchParams(params);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    performSearch(searchParams, page);
  };

  useEffect(() => {
    // Perform initial search on mount
    performSearch(searchParams);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <ApplicationSearchForm
          onSearch={(params) => performSearch(params)}
          initialName={searchParams.name}
          initialSectors={searchParams.sectors}
        />
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ApplicationSearchResults
            applications={applications}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}