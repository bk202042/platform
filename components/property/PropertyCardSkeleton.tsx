"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export function PropertyCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="h-6 bg-muted rounded-md w-3/4 animate-pulse"></div>
        <div className="h-4 bg-muted rounded-md w-1/2 mt-2 animate-pulse"></div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded-md w-1/3 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-muted rounded-md w-16 animate-pulse"></div>
            <div className="h-4 bg-muted rounded-md w-16 animate-pulse"></div>
            <div className="h-4 bg-muted rounded-md w-16 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded-md w-2/3 animate-pulse"></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="h-9 bg-muted rounded-md w-full animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}
