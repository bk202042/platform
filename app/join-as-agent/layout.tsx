export default function JoinAsAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Join Our Agent Network
          </h1>
          <p className="text-gray-600 mb-8">
            Join VinaHome as a real estate agent and gain access to our
            platform&apos;s powerful tools, exclusive listings, and a network of
            potential clients looking for properties in Vietnam.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
