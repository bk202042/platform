'use client';

import Link from 'next/link';

const footerSections = [
  {
    title: 'Popular Searches',
    links: [
      { name: 'Apartments Near Me', href: '/search?type=apartment' },
      { name: 'Houses for Sale', href: '/search?type=house&sale=true' },
      { name: 'Condos for Rent', href: '/search?type=condo&rent=true' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { name: 'Cities', href: '/search' },
      { name: 'FAQs', href: '#' },
      { name: 'For Sale', href: '/search?sale=true' },
    ],
  },
  {
    title: 'About',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Join as an agent', href: '/join-as-agent' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of Use', href: '/terms-of-use' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between">
          {footerSections.map((section) => (
            <div key={section.title} className="mb-6 w-1/2 md:w-auto md:mb-0">
              <h3 className="text-sm font-semibold text-gray-600">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} VinaHome. All Rights Reserved. Equal Housing Opportunity.</p>
          <p className="mt-1 text-[10px]">
            VinaHome is committed to ensuring digital accessibility for individuals with disabilities. We are continuously working to improve the accessibility of our web experience for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
}
