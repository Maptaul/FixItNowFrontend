import {
  ClipboardListIcon,
  CreditCardIcon,
  LifeBuoyIcon,
  RouteIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/design/accordion";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Help centre" };

const ROUTES = [
  {
    icon: ClipboardListIcon,
    title: "Track a booking",
    body: "See where every job is — requested, accepted, paid, in progress or done — and cancel the ones that haven't started.",
    href: "/dashboard/customer/bookings",
    cta: "My bookings",
  },
  {
    icon: CreditCardIcon,
    title: "Check a payment",
    body: "Every Stripe charge with its reference, so you can match it against your card statement.",
    href: "/dashboard/customer/payments",
    cta: "Payment history",
  },
  {
    icon: RouteIcon,
    title: "How booking works",
    body: "The full flow from finding a technician to leaving a review, and who acts at each step.",
    href: "/how-it-works",
    cta: "Read the guide",
  },
];

const FAQ_ITEMS = [
  {
    question: "My technician hasn't accepted yet. What now?",
    answer:
      "A request sits at Requested until the technician accepts or declines it. Your slot is held meanwhile, and nothing has been charged. If it's taking too long, cancel free of charge and book someone else — the browse page shows who has slots open today.",
  },
  {
    question: "I was charged but my booking still says Accepted.",
    answer:
      "Payment confirmation can arrive a moment after Stripe redirects you back. Reload the booking; if it still hasn't moved to Paid, open the payment history — a settled row there means the money reached us and the booking will catch up.",
  },
  {
    question: "Can I cancel after paying?",
    answer:
      "Yes, until the technician marks the job in progress. The booking cancels and the slot is released immediately. Getting the money back is handled outside the app, so contact your technician first.",
  },
  {
    question: "The technician didn't turn up.",
    answer:
      "Cancel the booking — that frees your slot and their calendar — then leave the job unreviewed. Only completed jobs can be reviewed, so an abandoned booking never affects your review history.",
  },
  {
    question: "Can I change my review?",
    answer:
      "No. One review per completed booking and it's final. That's deliberate: a review that can be quietly rewritten is worth very little to the next customer reading it.",
  },
  {
    question: "How do I change my password?",
    answer: (
      <>
        On{" "}
        <Link
          href="/dashboard/customer/profile"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          My profile
        </Link>
        . Leave the field blank to keep your current one.
      </>
    ),
  },
];

export default function CustomerSupportPage() {
  return (
    <>
      <PageHeader
        title="Help centre"
        description="The things customers ask most, and where to go for the rest."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {ROUTES.map((route) => (
          <Link
            key={route.title}
            href={route.href}
            className="group flex flex-col rounded-panel border border-line bg-surface p-6 shadow-sh2 transition-all duration-160 hover:-translate-y-0.5 hover:shadow-sh3"
          >
            <span className="mb-4 grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
              <route.icon aria-hidden="true" className="size-5" />
            </span>

            <p className="mb-1.5 text-cardtitle text-text">{route.title}</p>
            <p className="mb-4 text-body2 text-text2">{route.body}</p>

            <span className="mt-auto text-btn text-primary group-hover:text-primary-hover">
              {route.cta} →
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <LifeBuoyIcon aria-hidden="true" className="size-4 text-text3" />
          <h2 className="text-panel text-text">Common questions</h2>
        </div>

        <Faq items={FAQ_ITEMS} className="max-w-3xl" />
      </section>
    </>
  );
}
