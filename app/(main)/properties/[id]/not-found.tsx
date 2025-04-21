import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The property you are looking for does not exist or has been removed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/properties">
          <Button variant="outline">View all properties</Button>
        </Link>
        <Link href="/search">
          <Button>Search properties</Button>
        </Link>
      </div>
    </div>
  );
}
