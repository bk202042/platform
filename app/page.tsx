import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Container from '../components/Container';

export default function Home() {
  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <main className="w-full max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find Your Perfect Property in Vietnam</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover properties tailored for Korean expatriates in Vietnam's most popular locations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Rent</CardTitle>
                <CardDescription>월세 (Wolse)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Find rental properties with flexible terms in prime locations</p>
              </CardContent>
              <CardFooter>
                <Link href="/search?propertyType=월세" className="w-full">
                  <Button className="w-full">Browse Rentals</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase</CardTitle>
                <CardDescription>매매 (Maemae)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Invest in premium properties in Vietnam's growing real estate market</p>
              </CardContent>
              <CardFooter>
                <Link href="/search?propertyType=매매" className="w-full">
                  <Button className="w-full">Browse Properties</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>Find your perfect match</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Use our advanced search to find properties that match your exact criteria</p>
              </CardContent>
              <CardFooter>
                <Link href="/search" className="w-full">
                  <Button className="w-full" variant="outline">Advanced Search</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">For Korean Expatriates in Vietnam</h2>
            <p className="text-muted-foreground mb-6">
              Our platform specializes in properties near Korean communities, international schools, and Korean amenities
            </p>
            <Link href="/search">
              <Button size="lg">Start Your Search</Button>
            </Link>
          </div>
        </main>
      </div>
    </Container>
  );
}
