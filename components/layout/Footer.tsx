import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Popular Searches (Placeholder) */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">
              Popular Searches
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Apartments Near Me
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Houses for Sale
                </Link>
              </li>
              {/* Add more links */}
            </ul>
          </div>

          {/* Column 2: Explore (Placeholder) */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Neighborhoods
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Cities
                </Link>
              </li>
              {/* Add more links */}
            </ul>
          </div>

          {/* Column 3: About (Placeholder) */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Careers
                </Link>
              </li>
              {/* Add more links */}
            </ul>
          </div>

          {/* Column 4: Legal (Placeholder) */}
          <div>
            <h3 className="font-semibold mb-3 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              {/* Add more links */}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          © {currentYear} VinaProp. All rights reserved.{" "}
          {/* Placeholder Name */}
          {/* Add any required legal disclaimers or license info here */}
        </div>
      </div>
    </footer>
  );
}
