"use client";

import Link from "next/link";

const footerSections = [
  {
    title: "Popular Searches",
    links: [
      { name: "Apartments Near Me", href: "#" },
      { name: "Houses for Sale", href: "#" },
      { name: "Condos for Rent", href: "#" },
    ],
  },
  {
    title: "Explore",
    links: [
      { name: "Cities", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Guides", href: "#" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "About Us", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of Use", href: "/terms-of-use" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul role="list" className="mt-4 space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-gray-500 hover:text-gray-900"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} VinaHome. All rights reserved.
            Equal Housing Opportunity.
          </p>
          <p className="mt-4 text-xs text-gray-400 xl:text-center">
            VinaHome is committed to ensuring digital accessibility for
            individuals with disabilities. We are continuously working to
            improve the accessibility of our web experience for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
}
