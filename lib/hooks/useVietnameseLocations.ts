import { useState, useEffect, useCallback } from "react";
import {
  LocationSearchResult,
  UserLocation,
  VietnameseCity,
  VietnameseApartment,
} from "@/lib/data/vietnamese-locations";

// Hook for location search with debouncing
export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = useCallback(
    async (
      searchQuery: string,
      type: "city" | "apartment" | "all" = "all",
      limit: number = 10
    ) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/community/locations?q=${encodeURIComponent(searchQuery)}&type=${type}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to search locations");
        }

        const data = await response.json();
        setResults(data.locations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchLocations(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchLocations]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchLocations,
  };
}

// Hook for managing user location preferences
export function useUserLocations() {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/community/user-locations");

      if (!response.ok) {
        throw new Error("Failed to fetch user locations");
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addLocationPreference = useCallback(
    async (
      cityId: string,
      apartmentId?: string,
      makePrimary: boolean = false
    ) => {
      try {
        const response = await fetch("/api/community/user-locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cityId,
            apartmentId,
            makePrimary,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add location preference");
        }

        // Refresh the locations list
        await fetchUserLocations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add location");
        return false;
      }
    },
    [fetchUserLocations]
  );

  const setPrimaryLocation = useCallback(
    async (cityId: string, apartmentId?: string) => {
      try {
        const response = await fetch("/api/community/user-locations", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cityId,
            apartmentId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to set primary location");
        }

        // Refresh the locations list
        await fetchUserLocations();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to set primary location"
        );
        return false;
      }
    },
    [fetchUserLocations]
  );

  const removeLocationPreference = useCallback(
    async (locationId: string) => {
      try {
        const response = await fetch(
          `/api/community/user-locations?locationId=${locationId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove location preference");
        }

        // Refresh the locations list
        await fetchUserLocations();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to remove location"
        );
        return false;
      }
    },
    [fetchUserLocations]
  );

  // Load user locations on mount
  useEffect(() => {
    fetchUserLocations();
  }, [fetchUserLocations]);

  return {
    locations,
    isLoading,
    error,
    addLocationPreference,
    setPrimaryLocation,
    removeLocationPreference,
    refetch: fetchUserLocations,
  };
}

// Hook for getting Vietnamese cities
export function useVietnameseCities() {
  const [cities, setCities] = useState<VietnameseCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/community/locations");

      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }

      const data = await response.json();
      setCities(data.cities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cities");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return {
    cities,
    isLoading,
    error,
    refetch: fetchCities,
  };
}

// Hook for getting apartments by city
export function useApartmentsByCity(cityId?: string) {
  const [apartments, setApartments] = useState<VietnameseApartment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApartments = useCallback(async (selectedCityId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/community/locations?cityId=${selectedCityId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch apartments");
      }

      const data = await response.json();
      setApartments(data.apartments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load apartments"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cityId) {
      fetchApartments(cityId);
    } else {
      setApartments([]);
    }
  }, [cityId, fetchApartments]);

  return {
    apartments,
    isLoading,
    error,
    refetch: cityId ? () => fetchApartments(cityId) : () => {},
  };
}

// Hook for popular Vietnamese locations
export function usePopularLocations() {
  const [locations, setLocations] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/community/locations?popular=true");

      if (!response.ok) {
        throw new Error("Failed to fetch popular locations");
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load popular locations"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularLocations();
  }, [fetchPopularLocations]);

  return {
    locations,
    isLoading,
    error,
    refetch: fetchPopularLocations,
  };
}

// Hook for location autocomplete
export function useLocationAutocomplete() {
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/community/locations?q=${encodeURIComponent(query)}&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.locations || []);
      }
    } catch (err) {
      console.error("Failed to get location suggestions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    getSuggestions,
    clearSuggestions,
  };
}
