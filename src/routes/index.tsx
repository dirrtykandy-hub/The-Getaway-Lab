import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "";
  } catch {
    return "";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

function Home() {
  const businessName = Route.useLoaderData();

  return (
    <div className="min-h-dvh">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-lg font-bold text-brand-navy">
              {businessName || "The Getaway Lab"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/survey"
              className="btn-primary !px-5 !py-2.5 !text-sm"
            >
              Start Your Free Itinerary
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-teal/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-sand/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-ocean/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-sky/50 px-4 py-1.5 text-sm font-medium text-brand-teal backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
            Your dream vacation starts here
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="gradient-text">
              Your Perfect Vacation
            </span>
            <br />
            <span className="text-brand-navy">
              Planned in Minutes
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            Tell us what you love — beaches, mountains, city lights, or a bit of
            everything. We'll build you a complete itinerary with costs, stays,
            dining, and activities. No research required.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/survey" className="btn-primary text-lg">
              Get Your Free Itinerary
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary text-lg"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {[
              { value: "60s", label: "To complete survey" },
              { value: "100%", label: "Tailored to you" },
              { value: "50+", label: "Destinations covered" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white/60 p-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-brand-teal sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500">
              Three simple steps to your dream vacation
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: "📋",
                title: "Tell Us Your Preferences",
                desc: "Answer a quick survey about your budget, destination vibe, travel style, group size, and what you love to do.",
              },
              {
                step: "02",
                icon: "✨",
                title: "Get Your Personalized Itinerary",
                desc: "We curate a complete day-by-day plan with hotel picks, dining spots, activities, and estimated costs — all tailored to you.",
              },
              {
                step: "03",
                icon: "🛒",
                title: "Book Everything in One Place",
                desc: "Flights, hotels, car rentals, dining reservations, and tours — with affiliate-linked recommendations so you save time and money.",
              },
            ].map((item) => (
              <div key={item.step} className="card text-center">
                <div className="mb-4 text-4xl">{item.icon}</div>
                <div className="mb-2 text-sm font-semibold text-brand-teal">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-bold text-brand-navy">
                  {item.title}
                </h3>
                <p className="mt-3 text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trip Types */}
      <section className="bg-white/40 py-20 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
              Find Your Perfect Escape
            </h2>
            <p className="mt-3 text-gray-500">
              Whatever your style, we've got you covered
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                emoji: "🌲",
                title: "Forest & Outdoors",
                desc: "Hiking trails, cabin stays, national parks, and fresh mountain air.",
                color: "from-emerald-500/20 to-green-500/10",
              },
              {
                emoji: "🏖️",
                title: "Beach Getaway",
                desc: "Sandy shores, ocean views, water sports, and tropical sunsets.",
                color: "from-cyan-500/20 to-blue-500/10",
              },
              {
                emoji: "🌆",
                title: "City Explorer",
                desc: "Museums, restaurants, nightlife, and urban adventures.",
                color: "from-purple-500/20 to-pink-500/10",
              },
              {
                emoji: "🎲",
                title: "Mixed Adventure",
                desc: "A bit of everything — nature, city, and relaxation in one trip.",
                color: "from-amber-500/20 to-orange-500/10",
              },
            ].map((type) => (
              <div
                key={type.title}
                className={`card overflow-hidden bg-gradient-to-br ${type.color}`}
              >
                <div className="mb-3 text-3xl">{type.emoji}</div>
                <h3 className="text-lg font-bold text-brand-navy">
                  {type.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {type.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="card mx-auto max-w-2xl">
            <div className="text-5xl">💼</div>
            <blockquote className="mt-6 text-xl leading-relaxed text-gray-600 italic">
              "Planning our family vacation used to take weeks of research. The
              Getaway Lab gave us a complete plan in under a minute — and it was
              exactly what we wanted."
            </blockquote>
            <div className="mt-6">
              <div className="font-semibold text-brand-navy">— Sarah & Family</div>
              <div className="text-sm text-gray-400">San Diego, CA</div>
            </div>
          </div>

          <div className="mt-12">
            <Link to="/survey" className="btn-primary text-lg">
              Start Planning Your Trip
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-brand-navy">
              {businessName || "The Getaway Lab"}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            Your perfect vacation starts here. © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}