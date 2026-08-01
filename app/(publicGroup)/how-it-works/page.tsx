import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CreditCardIcon,
  SearchIcon,
  StarIcon,
  WrenchIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/design/accordion";
import { Mono } from "@/components/design/money";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { IBookingStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From finding a technician to paying and reviewing — every step of a FixItNow booking, and who acts at each one.",
};

const STEPS = [
  {
    step: "01",
    icon: SearchIcon,
    title: "Find the right pro",
    body: "Filter by trade, area, budget and rating. Every listing shows the total price for the visit, not a starting point you'll argue about later.",
  },
  {
    step: "02",
    icon: CalendarCheckIcon,
    title: "Pick a free slot",
    body: "Technicians publish the hours they actually work. Booked slots stay visible but struck through, so you can see how busy someone is before you commit.",
  },
  {
    step: "03",
    icon: CreditCardIcon,
    title: "Pay once accepted",
    body: "Nothing is charged when you request. Payment opens only after the technician accepts, and it runs through Stripe's hosted checkout — card details never touch FixItNow.",
  },
  {
    step: "04",
    icon: StarIcon,
    title: "Track it, then rate it",
    body: "Follow the job from accepted to in-progress to complete. Once it's done you can leave one review, and it goes live on the technician's profile straight away.",
  },
];

/** The lifecycle exactly as the API enforces it. */
const LIFECYCLE: {
  status: IBookingStatus;
  who: string;
  what: string;
}[] = [
  {
    status: "REQUESTED",
    who: "You",
    what: "You've picked a service and a slot. The slot is held while the technician decides.",
  },
  {
    status: "ACCEPTED",
    who: "Technician",
    what: "They've taken the job. This is when the Pay button appears for you.",
  },
  {
    status: "PAID",
    who: "You",
    what: "Stripe has confirmed the payment. The technician can now start.",
  },
  {
    status: "IN_PROGRESS",
    who: "Technician",
    what: "Work has started. Cancellation closes at this point.",
  },
  {
    status: "COMPLETED",
    who: "Technician",
    what: "The job is done and you can leave a review.",
  },
];

const ENDINGS: { status: IBookingStatus; what: string }[] = [
  {
    status: "DECLINED",
    what: "The technician couldn't take it. Your slot is released and nothing was charged.",
  },
  {
    status: "CANCELLED",
    what: "You cancelled before work started. The slot goes back on their calendar.",
  },
];

const TRACKS = [
  {
    icon: SearchIcon,
    title: "If you need a job done",
    points: [
      "Browse without an account — you only need one to book.",
      "See the total before you request, including which technician you're getting.",
      "Cancel free any time before work starts.",
      "Track every status change from your dashboard.",
    ],
    cta: { href: "/services", label: "Browse services" },
  },
  {
    icon: WrenchIcon,
    title: "If you fix things for a living",
    points: [
      "List services with a fixed price — customers see the total, so nobody haggles at the door.",
      "Publish the hours you actually work; customers book straight into them.",
      "Accept or decline each request, then move the job to in-progress and complete.",
      "Your rating and reviews build on your public profile.",
    ],
    cta: {
      href: "/auth/register?role=TECHNICIAN",
      label: "Join as a technician",
    },
  },
];

const FAQ_ITEMS = [
  {
    question: "When am I actually charged?",
    answer:
      "Only after a technician accepts your request. Requesting a booking charges nothing — the Pay button doesn't even appear until the status turns Accepted.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Yes, free of charge, any time before the technician marks the job in-progress. Cancelling releases your slot back onto their calendar immediately.",
  },
  {
    question: "What if nobody has a free slot?",
    answer:
      "Technicians publish dated availability, so a profile with no open slots genuinely has none. Try another technician in the same category — the browse page lets you filter by area and rating.",
  },
  {
    question: "Who handles the payment?",
    answer:
      "Stripe, on its own hosted checkout page. FixItNow never sees or stores your card details. You're redirected there and back again once it's done.",
  },
  {
    question: "Can I change a review after posting it?",
    answer:
      "No. One review per completed booking, and it's final — a review that can be quietly rewritten isn't worth much to the next customer reading it.",
  },
  {
    question: "Do I need an account to look around?",
    answer:
      "No. Services, technician profiles, prices and reviews are all public. An account is only needed to request a booking.",
  },
];

const HowItWorksPage = () => {
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
              <li className="text-text2">How it works</li>
            </ol>
          </nav>

          <h1 className="max-w-2xl text-[32px] font-extrabold tracking-[-0.035em] text-text sm:text-[40px] lg:text-hero lg:leading-[1.05]">
            Booking a technician, start to finish.
          </h1>

          <p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-text2 lg:text-[18px]">
            Four steps, one fixed price, and a status you can check at any
            point. Here&apos;s exactly what happens and who&apos;s holding the
            job at each stage.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li key={item.step}>
              <span className="mb-4 grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                <item.icon aria-hidden="true" className="size-5" />
              </span>

              <Mono className="mb-2 block text-[13px] font-semibold text-primary">
                {item.step}
              </Mono>

              <p className="mb-1.5 text-cardtitle text-text">{item.title}</p>
              <p className="text-body2 text-text2">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Lifecycle */}
      <section className="border-y border-line bg-surface2/40">
        <div className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
          <h2 className="text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
            Every status, and who acts next
          </h2>
          <p className="mt-1.5 max-w-xl text-[15px] text-text2">
            These are the real statuses on your booking — the same words you see
            on your dashboard.
          </p>

          <ol className="mt-8 space-y-3">
            {LIFECYCLE.map((entry, index) => (
              <li
                key={entry.status}
                className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-sh1 sm:flex-row sm:items-center"
              >
                <span className="flex shrink-0 items-center gap-3 sm:w-52">
                  <Mono className="text-[13px] text-text3">
                    {String(index + 1).padStart(2, "0")}
                  </Mono>
                  <BookingStatusBadge status={entry.status} />
                </span>

                <span className="shrink-0 text-[12px] font-semibold text-text3 uppercase sm:w-24">
                  {entry.who}
                </span>

                <span className="text-body2 text-text2">{entry.what}</span>
              </li>
            ))}
          </ol>

          <p className="mt-8 mb-3 text-label text-text">
            Two ways a booking can end early
          </p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {ENDINGS.map((entry) => (
              <li
                key={entry.status}
                className="rounded-card border border-line bg-surface p-4 shadow-sh1"
              >
                <BookingStatusBadge status={entry.status} />
                <p className="mt-2.5 text-body2 text-text2">{entry.what}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Two tracks */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-5 lg:grid-cols-2">
          {TRACKS.map((track) => (
            <div
              key={track.title}
              className="flex flex-col rounded-panel border border-line bg-surface p-6 shadow-sh2"
            >
              <span className="mb-4 grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
                <track.icon aria-hidden="true" className="size-5" />
              </span>

              <h2 className="mb-3 text-panel text-text">{track.title}</h2>

              <ul className="mb-6 space-y-2.5">
                {track.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-body2 text-text2"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {point}
                  </li>
                ))}
              </ul>

              <Button className="mt-auto w-fit" asChild>
                <Link href={track.cta.href}>
                  {track.cta.label}
                  <ArrowRightIcon />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="mx-auto w-full max-w-[1240px] scroll-mt-24 px-5 pb-16 lg:px-10 lg:pb-20"
      >
        <h2 className="mb-5 text-[24px] font-extrabold tracking-[-0.03em] text-text lg:text-section">
          Common questions
        </h2>

        <Faq items={FAQ_ITEMS} className="max-w-3xl" />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" asChild>
            <Link href="/services">Browse services</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default HowItWorksPage;
