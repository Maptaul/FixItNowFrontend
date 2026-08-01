import {
  ArrowRightIcon,
  BanknoteIcon,
  CheckIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Faq } from "@/components/design/accordion";
import { Button } from "@/components/ui/button";
import {
  PricingTable,
  PricingTableSkeleton,
} from "../_components/PricingTable";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Fixed prices shown before you book, payment only after your technician accepts, and free cancellation until work starts.",
};

const PRINCIPLES = [
  {
    icon: ReceiptTextIcon,
    title: "The listed price is the total",
    body: "Every service carries one number, set by the technician. That's what you agree to when you request, and it's the amount Stripe charges. No call-out fee bolted on at the door.",
  },
  {
    icon: BanknoteIcon,
    title: "Nothing upfront",
    body: "Requesting a booking charges nothing. Payment only opens once the technician accepts — until then there's no card, no hold, no commitment.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Free to cancel until work starts",
    body: "Change your mind any time before the job is marked in-progress and it costs nothing. Your slot goes straight back on the technician's calendar.",
  },
];

const INCLUDED = [
  "The technician's time for the visit as listed",
  "The scope written on the service listing",
  "A booking you can track from requested to completed",
  "One review once the job is done",
];

const NOT_INCLUDED = [
  "Parts or materials the technician has to source",
  "Work outside the scope of the service you booked",
  "A second visit, if the job turns out to need one",
];

const FAQ_ITEMS = [
  {
    question: "Is the price on a listing really the final price?",
    answer:
      "It's the amount you're charged for that service. If the job turns out to need parts or work beyond what the listing covers, that's agreed with the technician separately — FixItNow only ever charges the listed total.",
  },
  {
    question: "When does money actually leave my account?",
    answer:
      "When you complete Stripe checkout, which is only available after a technician accepts your request. Before that point, no payment method has even been asked for.",
  },
  {
    question: "What happens to my money if the technician declines?",
    answer:
      "Nothing was taken. Payment can't be started on a booking that isn't accepted, so a declined request never involves a charge.",
  },
  {
    question: "How are the 'starts from' prices worked out?",
    answer:
      "They're the cheapest service currently listed in that category, read live from the platform. They move as technicians add, edit and remove listings — nothing on this page is a fixed rate card.",
  },
  {
    question: "I'm a technician. What do I set?",
    answer:
      "A price per service. That number is what the customer sees, what they agree to, and what they're charged — you're setting the total, not a starting bid.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-caption text-text3">
              <li>
                <Link href="/" className="hover:text-text2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-text2">Pricing</li>
            </ol>
          </nav>

          <h1 className="max-w-2xl text-[32px] font-extrabold tracking-[-0.035em] text-text sm:text-[40px] lg:text-hero lg:leading-[1.05]">
            You see the total before anyone rings your bell.
          </h1>

          <p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-text2 lg:text-[18px]">
            Technicians set one fixed price per service. No haggling at the
            door, no surprise line items, and nothing charged until your job is
            accepted.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="rounded-panel border border-line bg-surface p-6 shadow-sh2"
            >
              <span className="mb-4 grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                <principle.icon aria-hidden="true" className="size-5" />
              </span>

              <h2 className="mb-2 text-panel text-text">{principle.title}</h2>
              <p className="text-body2 text-text2">{principle.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live prices */}
      <section className="border-y border-line bg-surface2/40">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
                What things cost right now
              </h2>
              <p className="mt-1.5 max-w-xl text-[15px] text-text2">
                Read live from the platform — these are the cheapest services
                technicians have actually listed, not a rate card.
              </p>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/services">Browse all services</Link>
            </Button>
          </div>

          <Suspense fallback={<PricingTableSkeleton />}>
            <PricingTable />
          </Suspense>
        </div>
      </section>

      {/* Included / not included */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
            <h2 className="mb-4 text-panel text-text">
              What the price covers
            </h2>
            <ul className="space-y-2.5">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5 text-body2 text-text2">
                  <CheckIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
            <h2 className="mb-4 text-panel text-text">What it doesn&apos;t</h2>
            <ul className="space-y-2.5">
              {NOT_INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5 text-body2 text-text2">
                  <XIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-text3"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-caption text-text3">
              Anything on this list is agreed directly with your technician
              before they do it.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-14 lg:px-10">
        <h2 className="mb-5 text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
          Questions about money
        </h2>

        <Faq items={FAQ_ITEMS} className="max-w-3xl" />
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-20 lg:px-10">
        <div className="flex flex-col items-center gap-4 rounded-modal border border-primary-border bg-primary-soft px-6 py-12 text-center">
          <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
            Know what it costs before you book
          </h2>
          <p className="max-w-md text-body text-text2">
            Filter by trade and budget, and every result shows the total for
            the visit.
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/services">
                Browse services
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
