import { Suspense } from "react";
import SearchForm from "./_components/SearchForm";
import SearchResults from "./_components/SearchResults";
import { PropertyDataProvider } from "@/components/providers/PropertyDataProvider";

export const metadata = {
  title: "Search Properties | Vietnam Property Platform",
  description: "Search for properties in Vietnam that match your criteria",
};

// In Next.js 15.3.1, searchParams must be a Promise type
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await the searchParams Promise to access its values
  const resolvedSearchParams = await searchParams;
  
  return (
    <PropertyDataProvider>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Search Properties
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <SearchForm />
          </div>

          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading...</div>}>
              <SearchResults
                searchParams={Object.fromEntries(
                  Object.entries(resolvedSearchParams).map(([key, value]) => [
                    key,
                    Array.isArray(value)
                      ? value[0] ?? ''
                      : value ?? ''
                  ])
                )}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </PropertyDataProvider>
  );
}
