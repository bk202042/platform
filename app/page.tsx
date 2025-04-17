import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Container from '../components/Container';

export default function Home() {
  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <main className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Next.js Boilerplate</CardTitle>
              <CardDescription>A minimal, clean starting point for your Next.js project with shadcn/ui.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Sign In</Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </Container>
  );
}
