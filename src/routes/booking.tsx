import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/booking")({
  component: BookingPage,
});

const STORAGE_KEY = "getaway-survey";

interface SurveyData {
  destination: string;
  tripType: string;
  duration: string;
  adults: string;
  kids: string;
  budget: string;
  travelMethod: string;
  dates: string;
}

type BookingCategory = "flights" | "cars" | "hotels" | "dining" | "tours" | "cruises";

const categories: { key: BookingCategory; label: string; emoji: string; desc: string }[] = [
  { key: "flights", label: "Flights", emoji: "✈️", desc: "Find the best airfare" },
  { key: "hotels", label: "Hotels & Stays", emoji: "🏨", desc: "Book your accommodation" },
  { key: "cars", label: "Car Rentals", emoji: "🚗", desc: "Get around with ease" },
  { key: "dining", label: "Dining Reservations", emoji: "🍽️", desc: "Reserve the best tables" },
  { key: "tours", label: "Tours & Activities", emoji: "🎯", desc: "Book experiences" },
  { key: "cruises", label: "Cruises", emoji: "🚢", desc: "Set sail on adventure" },
];

function BookingPage() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [activeCategory, setActiveCategory] = useState<BookingCategory>("flights");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const dest = data?.destination || "your destination";
  const adults = Number(data?.adults) || 2;
  const kids = Number(data?.kids) || 0;
  const totalTravelers = adults + kids;
  const duration = Number(data?.duration) || 3;
  const travelMethod = data?.travelMethod || "flight";
  const budget = data?.budget || "medium";

  return (
    <div className="min-h-dvh py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <a
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-teal transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
          <h1 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            🛒 Booking Center
          </h1>
          <p className="mt-2 text-gray-500">
            Everything you need for your trip to{" "}
            <span className="font-semibold text-brand-teal">{dest}</span> — all in one place
          </p>
        </div>

        {/* Quick links to pages */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <Link to="/itinerary" className="text-sm text-brand-ocean hover:text-brand-teal underline underline-offset-2">
            ← Back to itinerary
          </Link>
          <Link to="/survey" className="text-sm text-brand-ocean hover:text-brand-teal underline underline-offset-2">
            Edit survey
          </Link>
        </div>

        {/* Trip summary bar */}
        {data && (
          <div className="card mb-8 bg-gradient-to-r from-brand-sky/30 via-white/50 to-brand-cream/30">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <span>📍 <strong>{dest}</strong></span>
              <span>📅 <strong>{data.dates || `${duration} nights`}</strong></span>
              <span>👥 <strong>{totalTravelers} traveler{totalTravelers !== 1 ? "s" : ""}</strong></span>
              <span>💰 <strong className="capitalize">{budget}</strong></span>
              <span>🚗 <strong className="capitalize">{travelMethod}</strong></span>
            </div>
          </div>
        )}

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "border-brand-teal bg-brand-teal/10 text-brand-teal shadow-sm"
                  : "border-gray-200 bg-white/60 text-gray-600 hover:border-gray-300 hover:bg-white"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active category panel */}
        <div className="mb-12">
          {activeCategory === "flights" && <FlightsPanel dest={dest} duration={duration} adults={adults} budget={budget} />}
          {activeCategory === "hotels" && <HotelsPanel dest={dest} duration={duration} budget={budget} />}
          {activeCategory === "cars" && <CarsPanel dest={dest} duration={duration} />}
          {activeCategory === "dining" && <DiningPanel dest={dest} />}
          {activeCategory === "tours" && <ToursPanel dest={dest} budget={budget} />}
          {activeCategory === "cruises" && <CruisesPanel dest={dest} />}
        </div>

        {/* How bookings work */}
        <section className="mb-12 text-center">
          <div className="card mx-auto max-w-xl">
            <h3 className="font-bold text-brand-navy">🔗 How Booking Works</h3>
            <p className="mt-2 text-sm text-gray-500">
              We partner with trusted providers like Expedia, Booking.com, and OpenTable.
              Click any link to book through our affiliate partners — same price, and it
              helps keep The Getaway Lab free for you!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─── Flights Panel ─── */

function FlightsPanel({
  dest,
  duration,
  adults,
  budget,
}: {
  dest: string;
  duration: number;
  adults: number;
  budget: string;
}) {
  const cabinClass = budget === "luxury" || budget === "premium" ? "first" : budget === "medium" ? "business" : "economy";
  const airlines = [
    { name: "SkyLink Airlines", price: 299, rating: 4.2, stops: 0, time: "3h 45m" },
    { name: "AeroVista", price: 249, rating: 4.0, stops: 1, time: "5h 20m" },
    { name: "BudgetWings", price: 179, rating: 3.8, stops: 1, time: "6h 10m" },
    { name: "PremiumAir", price: 589, rating: 4.7, stops: 0, time: "3h 30m" },
  ];

  const searchUrl = `https://expedia.com/Flights-Search?destination=${encodeURIComponent(dest)}&adults=${adults}&cabin=${cabinClass}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-navy">✈️ Flights to {dest}</h2>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-5 !py-2.5 !text-sm"
        >
          Search All Flights
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {airlines.map((airline) => (
          <div key={airline.name} className="card flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-navy">{airline.name}</h3>
              <span className="rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                {airline.stops === 0 ? "Nonstop" : `${airline.stops} stop`}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{airline.time}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-teal">${airline.price}</div>
                <div className="text-xs text-gray-400">per person</div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
              <span>⭐</span> {airline.rating}
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-ocean py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              Book This Flight
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Hotels Panel ─── */

function HotelsPanel({
  dest,
  duration,
  budget,
}: {
  dest: string;
  duration: number;
  budget: string;
}) {
  const searchUrl = `https://booking.com/searchresults.html?ss=${encodeURIComponent(dest)}&checkin=&checkout=&group_adults=2&no_rooms=1`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-navy">🏨 Hotels & Stays in {dest}</h2>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-5 !py-2.5 !text-sm"
        >
          Browse All Stays
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Grand Horizon Hotel", stars: 5, price: 350, type: "Hotel" },
          { name: "The Cozy Retreat", stars: 3, price: 150, type: "Hotel" },
          { name: "Beachfront Villa", stars: 4, price: 220, type: "Airbnb" },
          { name: "Downtown Loft", stars: 4, price: 180, type: "Airbnb" },
          { name: "Mountain Lodge", stars: 4, price: 280, type: "Resort" },
          { name: "Budget Inn Express", stars: 2, price: 85, type: "Hotel" },
        ].map((h) => (
          <div key={h.name} className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-navy">{h.name}</h3>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-teal">${h.price}</div>
                <div className="text-xs text-gray-400">/night</div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="text-gray-500">{"⭐".repeat(h.stars)}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{h.type}</span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              {duration} nights: <span className="font-semibold text-gray-600">${h.price * duration}</span>
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-ocean py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              View Deal
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Car Rentals Panel ─── */

function CarsPanel({ dest, duration }: { dest: string; duration: number }) {
  const searchUrl = `https://expedia.com/Car-Rentals/Search?destination=${encodeURIComponent(dest)}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-navy">🚗 Car Rentals in {dest}</h2>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-5 !py-2.5 !text-sm"
        >
          Compare Rentals
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { company: "DriveNow", car: "Toyota Corolla or similar", price: 45, type: "Economy" },
          { company: "Apex Rentals", car: "Honda CR-V or similar", price: 65, type: "SUV" },
          { company: "Luxe Drive", car: "BMW 3 Series or similar", price: 95, type: "Luxury" },
          { company: "Budget Wheels", car: "Hyundai i10 or similar", price: 32, type: "Compact" },
          { company: "Family Rides", car: "Toyota Sienna or similar", price: 78, type: "Minivan" },
          { company: "Eco Drive", car: "Tesla Model 3", price: 110, type: "Electric" },
        ].map((car) => (
          <div key={car.company} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-brand-navy">{car.company}</h3>
                <p className="text-sm text-gray-500">{car.car}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-teal">${car.price}</div>
                <div className="text-xs text-gray-400">/day</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {car.type}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              {duration} days: <span className="font-semibold text-gray-600">${car.price * duration}</span>
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-ocean py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              Book Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dining Panel ─── */

function DiningPanel({ dest }: { dest: string }) {
  const searchUrl = `https://opentable.com/s/${encodeURIComponent(dest)}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-navy">🍽️ Dining in {dest}</h2>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-5 !py-2.5 !text-sm"
        >
          Browse Restaurants
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "The Sunset Table", cuisine: "Seafood", price: "$$$", rating: 4.8 },
          { name: "Casa Bella", cuisine: "Italian", price: "$$", rating: 4.5 },
          { name: "Sakura House", cuisine: "Japanese", price: "$$", rating: 4.6 },
          { name: "The Local Fork", cuisine: "Farm-to-Table", price: "$$$", rating: 4.7 },
          { name: "Bangkok Street", cuisine: "Thai", price: "$", rating: 4.3 },
          { name: "Le Petit Bistro", cuisine: "French", price: "$$$$", rating: 4.9 },
        ].map((r) => (
          <div key={r.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-brand-navy">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.cuisine}</p>
              </div>
              <span className="text-lg font-bold text-brand-teal">{r.price}</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <span className="text-amber-400">⭐</span>
              <span className="font-medium text-gray-700">{r.rating}</span>
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-ocean py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              Reserve a Table
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tours Panel ─── */

function ToursPanel({
  dest,
  budget,
}: {
  dest: string;
  budget: string;
}) {
  const searchUrl = `https://viator.com/${encodeURIComponent(dest.replace(/,?\s*.+$/, "").toLowerCase())}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-navy">🎯 Tours & Activities in {dest}</h2>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-5 !py-2.5 !text-sm"
        >
          Browse Activities
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "City Highlights Tour", hours: 4, price: 65, tag: "Best Seller" },
          { name: "Guided Hiking Adventure", hours: 6, price: 89, tag: "Outdoor" },
          { name: "Sunset Catamaran Cruise", hours: 3, price: 120, tag: "Popular" },
          { name: "Cooking Class", hours: 3, price: 75, tag: "Culture" },
          { name: "Museum Private Tour", hours: 2, price: 55, tag: "Art" },
          { name: "Scuba Diving Experience", hours: 4, price: 150, tag: "Adventure" },
        ].map((t) => (
          <div key={t.name} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-brand-navy">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.hours} hours</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-teal">${t.price}</div>
                <div className="text-xs text-gray-400">/person</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
                {t.tag}
              </span>
            </div>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-ocean py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              Book Experience
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cruises Panel ─── */

function CruisesPanel({ dest }: { dest: string }) {
  const searchUrl = `https://expedia.com/Cruises/Search?destination=${encodeURIComponent(dest)}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-navy">🚢 Cruises</h2>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !px-5 !py-2.5 !text-sm"
        >
          Explore Cruises
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            name: "Caribbean Dream",
            nights: 7,
            price: 1299,
            desc: "Explore tropical islands, white sand beaches, and crystal clear waters.",
          },
          {
            name: "Mediterranean Explorer",
            nights: 10,
            price: 2499,
            desc: "Visit historic ports across Greece, Italy, and Spain.",
          },
          {
            name: "Alaskan Wilderness",
            nights: 7,
            price: 1899,
            desc: "Glaciers, wildlife, and rugged coastline views.",
          },
          {
            name: "River Rhine Romance",
            nights: 7,
            price: 2199,
            desc: "Charming European river towns and vineyards.",
          },
        ].map((cruise) => (
          <div key={cruise.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-brand-navy">{cruise.name}</h3>
                <p className="text-sm text-gray-500">{cruise.nights} nights</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-teal">${cruise.price}</div>
                <div className="text-xs text-gray-400">per person</div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">{cruise.desc}</p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block w-full rounded-xl bg-gradient-to-r from-brand-teal to-brand-ocean py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
            >
              View Cruise
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}