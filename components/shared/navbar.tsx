import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMe } from "@/service/getMe";

/**
 * Public site header — 70px sticky glass bar (--glass + blur(14px)) with a
 * 1px bottom border, per the handoff.
 */
const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/technicians", label: "Technicians" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/services", label: "Pricing" },
];

export async function Navbar() {
  const user = await getMe();

  return (
    <header className="fx-glass sticky top-0 z-50 h-[70px] border-b border-line">
      <nav className="mx-auto flex h-full w-full max-w-[1240px] items-center gap-8 px-5 lg:px-10">
        <Logo />

        <ul className="hidden items-center gap-[26px] text-body font-medium text-text2 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-text2 transition-colors duration-120 hover:text-text"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/auth/register?role=TECHNICIAN"
                className="hidden text-btn text-text2 transition-colors duration-120 hover:text-text xl:block"
              >
                Become a technician
              </Link>
              <Button variant="outline" size="md" asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button size="md" asChild className="hidden sm:inline-flex">
                <Link href="/services">Book a service</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-md"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <div className="grid gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.label}
                    variant="ghost"
                    className="justify-start"
                    asChild
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}

                {!user && (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/auth/register?role=TECHNICIAN">
                        Become a technician
                      </Link>
                    </Button>
                    <Button variant="outline" className="mt-2" asChild>
                      <Link href="/auth/login">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/services">Book a service</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
