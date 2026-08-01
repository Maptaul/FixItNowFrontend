import { Logo } from "@/components/shared/logo";
import Link from "next/link";

/** Footer — 1.4fr brand column + four link columns, per the handoff. */
const FOOTER_COLUMNS = [
  {
    heading: "Services",
    links: [
      { href: "/services", label: "AC repair" },
      { href: "/services", label: "Electrical" },
      { href: "/services", label: "Plumbing" },
      { href: "/services", label: "Cleaning" },
      { href: "/services", label: "All categories" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/technicians", label: "Our technicians" },
      { href: "/auth/register?role=TECHNICIAN", label: "Become a technician" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/how-it-works#faq", label: "Common questions" },
      { href: "/pricing", label: "What things cost" },
      { href: "/auth/login", label: "Log in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-10">
        <div className="space-y-3.5">
          <Logo />
          <p className="max-w-xs text-body2 text-text2">
            Verified home services across every neighbourhood we cover. Fixed
            prices, NID-verified technicians, 30-day workmanship warranty.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading} className="space-y-3">
            <p className="text-th text-text3 uppercase">{column.heading}</p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-body2 text-text2 transition-colors duration-120 hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-[1240px] px-5 py-4 text-caption text-text3 lg:px-10">
          © {new Date().getFullYear()} FixItNow — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
