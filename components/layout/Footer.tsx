import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F6F7F8] border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Popular Searches */}
          <div>
            <h3 className="text-[#2A2A33] font-semibold mb-4">
              Popular Searches
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Apartments Near Me
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Houses for Sale
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Open Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-[#2A2A33] font-semibold mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Neighborhoods
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Cities
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3 className="text-[#2A2A33] font-semibold mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-[#2A2A33] font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[#2A2A33] hover:text-[#007882] transition-colors text-sm"
                >
                  Fair Housing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="text-center text-sm text-[#2A2A33]">
            <p className="mb-2">
              © {currentYear} VinaProp. All rights reserved. Equal Housing
              Opportunity.
            </p>
            <p className="text-xs">
              VinaProp is committed to ensuring digital accessibility for
              individuals with disabilities. We are continuously working to
              improve the accessibility of our web experience for everyone.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
