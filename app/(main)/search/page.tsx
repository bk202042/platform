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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the searchParams Promise to access its values
  const resolvedSearchParams = await searchParams;

  return (
    <PropertyDataProvider>
      <div className="py-10 bg-[#f7f9fa] min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold mb-8 text-center">
            Search Properties
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <SearchForm />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <Suspense
                  fallback={
                    <div className="py-20 text-center text-muted-foreground">
                      Loading properties...
                    </div>
                  }
                >
                  <SearchResults
                    searchParams={Object.fromEntries(
                      Object.entries(resolvedSearchParams).map(
                        ([key, value]) => [
                          key,
                          Array.isArray(value)
                            ? (value[0] ?? "")
                            : (value ?? ""),
                        ],
                      ),
                    )}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PropertyDataProvider>
  );
}
