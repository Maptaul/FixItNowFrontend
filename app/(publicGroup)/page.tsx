import {
  CalendarCheckIcon,
  CreditCardIcon,
  SearchIcon,
  ShieldCheckIcon,
  StarIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "./_components/CardGridSkeleton";
import { CategoryStrip } from "./_components/CategoryStrip";
import { FeaturedServices } from "./_components/FeaturedServices";
import { TopTechnicians } from "./_components/TopTechnicians";

const HOW_IT_WORKS = [
  {
    icon: SearchIcon,
    title: "Find the right pro",
    body: "Filter by trade, location, budget and rating until you land on someone you trust.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Pick a free slot",
    body: "Technicians publish their availability. Choose a slot that works and send the request.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay once accepted",
    body: "Payment opens only after the technician accepts, handled securely by Stripe.",
  },
  {
    icon: StarIcon,
    title: "Track it, then rate it",
    body: "Follow the job from accepted to completed, then leave a review for the next customer.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="fx-surface-gradient border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <ShieldCheckIcon className="size-3.5 text-primary" />
            Vetted local professionals
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Your trusted home service platform
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            Book electricians, plumbers, cleaners and carpenters for a time that
            suits you. Pay securely, track every step.
          </p>

          {/* GET form — the query lands in the URL, so results are shareable. */}
          <form
            action="/services"
            className="mx-auto mt-8 flex w-full max-w-lg flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                type="search"
                placeholder="What needs fixing? e.g. leaking tap"
                aria-label="Search services"
                className="h-11 pl-9"
              />
            </div>
            <Button type="submit" size="lg" className="h-11">
              Search
            </Button>
          </form>

          <div className="mt-6">
            <Suspense
              fallback={
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
              }
            >
              <CategoryStrip />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Latest services
            </h2>
            <p className="text-sm text-muted-foreground">
              Fresh listings from technicians across every trade.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/services">Browse all</Link>
          </Button>
        </div>

        <Suspense fallback={<CardGridSkeleton count={6} />}>
          <FeaturedServices />
        </Suspense>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            How FixItNow works
          </h2>

          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title} className="space-y-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <p className="text-xs font-semibold text-muted-foreground">
                  STEP {index + 1}
                </p>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Top technicians */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Top-rated technicians
            </h2>
            <p className="text-sm text-muted-foreground">
              The highest rated pros on the platform right now.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/technicians">See all</Link>
          </Button>
        </div>

        <Suspense fallback={<CardGridSkeleton count={3} withImage={false} />}>
          <TopTechnicians />
        </Suspense>
      </section>

      {/* Technician CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="fx-surface-gradient flex flex-col items-center gap-4 rounded-2xl border px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <WrenchIcon className="size-5" />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            Do you fix things for a living?
          </h2>
          <p className="max-w-md text-muted-foreground text-pretty">
            List your services, publish the hours you actually work, and get
            paid the moment a job is accepted.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register?role=TECHNICIAN">
              Join as a technician
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
