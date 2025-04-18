'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PropertyDataContextType {
  isLoading: boolean;
  error: string | null;
  searchParams: Record<string, string>;
  updateSearchParams: (newParams: Record<string, string>) => void;
  resetSearchParams: () => void;
}

const PropertyDataContext = createContext<PropertyDataContextType | undefined>(undefined);

export function usePropertyData() {
  const context = useContext(PropertyDataContext);
  if (context === undefined) {
    throw new Error('usePropertyData must be used within a PropertyDataProvider');
  }
  return context;
}

interface PropertyDataProviderProps {
  children: ReactNode;
  initialSearchParams?: Record<string, string>;
}

export function PropertyDataProvider({ 
  children, 
  initialSearchParams = {} 
}: PropertyDataProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert searchParams to a regular object
  const currentSearchParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    currentSearchParams[key] = value;
  });
  
  // Update search parameters and navigate
  const updateSearchParams = useCallback((newParams: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Merge current params with new params
      const updatedParams = { ...currentSearchParams, ...newParams };
      
      // Remove any params with empty values
      Object.keys(updatedParams).forEach(key => {
        if (updatedParams[key] === '' || updatedParams[key] === undefined) {
          delete updatedParams[key];
        }
      });
      
      // Build query string
      const queryString = new URLSearchParams(updatedParams).toString();
      
      // Navigate to the new URL
      router.push(`${pathname}?${queryString}`);
    } catch (err) {
      console.error('Error updating search params:', err);
      setError('Failed to update search parameters');
    } finally {
      setIsLoading(false);
    }
  }, [currentSearchParams, pathname, router]);
  
  // Reset all search parameters
  const resetSearchParams = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Navigate to the current path without query params
      router.push(pathname);
    } catch (err) {
      console.error('Error resetting search params:', err);
      setError('Failed to reset search parameters');
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);
  
  const value = {
    isLoading,
    error,
    searchParams: currentSearchParams,
    updateSearchParams,
    resetSearchParams
  };
  
  return (
    <PropertyDataContext.Provider value={value}>
      {children}
    </PropertyDataContext.Provider>
  );
}
