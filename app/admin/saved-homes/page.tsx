import Link from "next/link";

export const metadata = {
  title: "Saved Homes | Vietnam Property Platform",
  description: "View and manage your saved homes",
};

export default function SavedHomesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row px-0">
      <div className="hidden lg:flex w-1/3 flex-col items-end pt-16 pr-8">
        <h1 className="text-4xl font-bold text-gray-800">Saved Homes</h1>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-start bg-white pt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 block lg:hidden w-full text-left px-4">
          Saved Homes
        </h1>
        <div className="flex flex-col items-center lg:items-start justify-start max-w-xl w-full px-4 lg:px-0">
          <p className="text-xl text-gray-700 mb-2 text-center lg:text-left">
            You haven&apos;t added any homes yet.
          </p>
          <p className="text-xl text-gray-700 mb-8 text-center lg:text-left">
            Start searching for properties to add now.
          </p>
          <Link
            href="/search"
            className="bg-[#E94F1D] hover:bg-[#c43e13] text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Search Homes
          </Link>
        </div>
      </div>
    </div>
  );
}
