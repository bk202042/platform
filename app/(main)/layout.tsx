import Container from "@/components/layout/Container";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container>
      {children}
    </Container>
  );
}
