import { MapPinIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Mono } from "@/components/design/money";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "./_components/CardGridSkeleton";
import {
  CategoryGrid,
  CategoryGridSkeleton,
} from "./_components/CategoryGrid";
import { FeaturedServices } from "./_components/FeaturedServices";
import {
  HeroSpotlight,
  HeroSpotlightSkeleton,
} from "./_components/HeroSpotlight";
import { TopTechnicians } from "./_components/TopTechnicians";

/*
 * Public home page — design_handoff_fixitnow § Screens › Public site › Home.
 * Marketing rhythm is the handoff's: sections at max-width 1240px with 40px
 * gutters, 48–76px vertical block spacing.
 */

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us what broke",
    body: "Pick a category and describe the fault. Photos help, but a sentence is enough.",
  },
  {
    step: "02",
    title: "Choose your technician",
    body: "Compare ratings, real prices and the slots they actually have free today.",
  },
  {
    step: "03",
    title: "Track the visit",
    body: "You get a status timeline from accepted to in-progress to complete.",
  },
  {
    step: "04",
    title: "Pay once accepted",
    body: "Secure card payment through Stripe — only after your technician accepts.",
  },
];

const TRUST_LINES = [
  "Fixed prices, shown upfront",
  "Verified technicians",
  "Track every job to done",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pt-14 pb-16 lg:px-10 lg:pt-[76px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-border bg-emerald-soft px-3 py-[5px] text-caption font-bold text-emerald">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-emerald"
              />
              Verified technicians, booking today
            </span>

            <h1 className="mb-4 text-[40px] leading-[1.05] font-extrabold tracking-[-0.04em] text-text sm:text-[48px] lg:text-hero">
              Home repairs, sorted today.
            </h1>

            <p className="mb-7 max-w-[480px] text-[17px] leading-[1.6] text-text2 lg:text-[18px]">
              Book a verified electrician, plumber or AC technician for a fixed
              price. No haggling at the door, no surprise bills — you see the
              total before anyone rings your bell.
            </p>

            {/* Search bar as a raised card: 10px padding, r18, --sh3. */}
            <form
              action="/services"
              className="mb-5 flex max-w-[560px] flex-col gap-2.5 rounded-panel border border-line bg-surface p-2.5 shadow-sh3 sm:flex-row"
            >
              <div className="flex flex-[1.3] items-center gap-2.5 px-3">
                <SearchIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text3"
                />
                <input
                  name="search"
                  type="search"
                  placeholder="What needs fixing?"
                  aria-label="What needs fixing?"
                  className="h-12 w-full min-w-0 bg-transparent text-body text-text outline-none placeholder:text-text2"
                />
              </div>

              <div
                aria-hidden="true"
                className="hidden w-px bg-line sm:block"
              />

              <div className="flex flex-1 items-center gap-2.5 px-3">
                <MapPinIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text3"
                />
                <input
                  name="location"
                  placeholder="Your area"
                  aria-label="Your area"
                  className="h-12 w-full min-w-0 bg-transparent text-body text-text outline-none placeholder:text-text2"
                />
              </div>

              <Button
                type="submit"
                className="h-12 rounded-lg px-[22px] text-[14.5px]"
              >
                Find
              </Button>
            </form>

            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] font-medium text-text3">
              {TRUST_LINES.map((line) => (
                <li key={line}>
                  <span aria-hidden="true">✓ </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <Suspense fallback={<HeroSpotlightSkeleton />}>
            <HeroSpotlight />
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-[72px] lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-1.5 text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
              Popular in your area
            </h2>
            <p className="text-[15px] text-text2">
              Every category is fixed-price. You see the total before you book.
            </p>
          </div>
          <Link
            href="/services"
            className="text-btn text-primary hover:text-primary-hover"
          >
            All categories →
          </Link>
        </div>

        <Suspense fallback={<CategoryGridSkeleton />}>
          <CategoryGrid />
        </Suspense>
      </section>

      {/* Latest services */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-[72px] lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-1.5 text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
              Latest services
            </h2>
            <p className="text-[15px] text-text2">
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

      {/* How it works — one r24 card with a 4-column numbered grid. */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-[1240px] px-5 pb-[72px] lg:px-10"
      >
        <div className="rounded-modal border border-line bg-surface p-7 shadow-sh2 lg:p-12">
          <h2 className="mb-9 text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
            How FixItNow works
          </h2>

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step}>
                <Mono className="mb-3 block text-[13px] font-semibold text-primary">
                  {item.step}
                </Mono>
                <p className="mb-1.5 text-cardtitle text-text">{item.title}</p>
                <p className="text-body2 text-text2">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Top technicians */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-[72px] lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mb-1.5 text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
              Top-rated technicians
            </h2>
            <p className="text-[15px] text-text2">
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
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-20 lg:px-10">
        <div className="flex flex-col items-center gap-4 rounded-modal border border-primary-border bg-primary-soft px-6 py-12 text-center">
          <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
            Do you fix things for a living?
          </h2>
          <p className="max-w-md text-body text-text2">
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
