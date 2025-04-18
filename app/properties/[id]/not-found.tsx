import Link from 'next/link';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropertyNotFound() {
  return (
    <Container>
      <div className="py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Property Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The property you are looking for does not exist or has been removed.
            </p>
            <div className="flex justify-center">
              <Link href="/properties">
                <Button>Browse All Properties</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
