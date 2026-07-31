import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const FOOTER_LINKS = [
  {
    heading: "Platform",
    links: [
      { href: "/services", label: "Browse services" },
      { href: "/technicians", label: "Find a technician" },
      { href: "/auth/register", label: "Become a technician" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/auth/login", label: "Log in" },
      { href: "/auth/register", label: "Create an account" },
      { href: "/dashboard", label: "My dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Vetted local professionals for the jobs you&apos;d rather not do
            yourself. Book a slot, pay securely, track it to done.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.heading} className="space-y-3">
            <p className="text-sm font-semibold">{group.heading}</p>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} FixItNow. Built for Programming Hero
          Level 2 — Assignment 5.
        </p>
      </div>
    </footer>
  );
}
