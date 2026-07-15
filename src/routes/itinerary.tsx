import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getSurveyResponse,
  getItineraryBySurveyId,
  saveItinerary,
  type SurveyData,
  type ItineraryData,
} from "~/lib/db-queries";

export const Route = createFileRoute("/itinerary")({
  component: ItineraryPage,
});

const STORAGE_KEY = "getaway-survey";

interface DayPlan {
  day: number;
  title: string;
  activities: { time: string; description: string }[];
  meals: { type: string; name: string; desc: string; link: string }[];
}

interface Itinerary {
  title: string;
  subtitle: string;
  destinationLabel: string;
  estimatedCost: { label: string; amount: string };
  hotels: { name: string; stars: number; desc: string; price: string; link: string; image: string }[];
  summary: string;
  days: DayPlan[];
  tips: string[];
}

function generateItinerary(data: SurveyData): Itinerary {
  const tripType = data.tripType || "mixed";
  const budget = data.budget || "medium";
  const duration = Number(data.duration) || 3;
  const adults = Number(data.adults) || 2;
  const kids = Number(data.kids) || 0;
  const dest = data.destination || getSuggestedDestination(tripType, data.vibe);
  const starRating = Number(data.starRating) || 3;
  const reason = data.reason || "relaxation";
  const activities = data.activities || [];

  // Cost estimation
  const nightlyRate = budget === "budget" ? 80 : budget === "medium" ? 180 : budget === "luxury" ? 350 : 600;
  const dailyFood = budget === "budget" ? 40 : budget === "medium" ? 80 : budget === "luxury" ? 150 : 250;
  const travelCost = budget === "budget" ? 200 : budget === "medium" ? 400 : budget === "luxury" ? 800 : 1500;
  const activitiesCost = budget === "budget" ? 100 : budget === "medium" ? 250 : budget === "luxury" ? 500 : 1000;
  const totalAccom = nightlyRate * duration;
  const totalFood = dailyFood * duration * (adults + kids * 0.5);
  const totalEstimate = totalAccom + totalFood + travelCost + activitiesCost;

  const currency = totalEstimate > 2000 ? "$" : "$";
  const costTier =
    totalEstimate > 5000
      ? "Premium"
      : totalEstimate > 2500
        ? "Mid-Range"
        : "Budget-Friendly";

  const hotelName = getHotelName(dest, budget, tripType);
  const hotelDesc = getHotelDesc(tripType, budget);

  const dayPlans: DayPlan[] = [];
  for (let d = 1; d <= Math.min(duration, 7); d++) {
    dayPlans.push(generateDayPlan(d, tripType, activities, dest, duration));
  }

  const tips = getTips(tripType, budget, reason, dest);

  return {
    title: `Your ${dest} Adventure`,
    subtitle: getTripSubtitle(tripType, reason, duration),
    destinationLabel: dest,
    estimatedCost: {
      label: `Estimated total (${costTier})`,
      amount: `$${Math.round(totalEstimate).toLocaleString()}`,
    },
    hotels: [
      {
        name: hotelName,
        stars: starRating,
        desc: hotelDesc,
        price: `$${nightlyRate}/night`,
        link: `https://expedia.com/redirect?hotel=${encodeURIComponent(hotelName)}&dest=${encodeURIComponent(dest)}`,
        image: getHotelEmoji(tripType),
      },
      {
        name: getAlternateHotel(dest, budget, tripType),
        stars: Math.max(starRating - 1, 2),
        desc: getAlternateHotelDesc(tripType, budget),
        price: `$${Math.round(nightlyRate * 0.75)}/night`,
        link: `https://airbnb.com/s/${encodeURIComponent(dest)}/homes`,
        image: "🏡",
      },
    ],
    summary: getTripSummary(tripType, dest, reason, duration, adults, kids, data.vibe),
    days: dayPlans,
    tips,
  };
}

function getSuggestedDestination(tripType: string, vibe: string): string {
  const v = vibe.toLowerCase();
  if (v.includes("romantic") || v.includes("couple")) {
    return tripType === "beach" ? "Santorini, Greece" : "Paris, France";
  }
  if (v.includes("family") || v.includes("kid")) {
    return "Orlando, Florida";
  }
  if (v.includes("adventure") || v.includes("wild")) {
    return "Costa Rica";
  }
  if (v.includes("quiet") || v.includes("peaceful") || v.includes("relax")) {
    return "Bali, Indonesia";
  }

  const options: Record<string, string[]> = {
    forest: ["Aspen, Colorado", "Smoky Mountains, Tennessee", "Swiss Alps, Switzerland", "Banff, Canada"],
    beach: ["Maldives", "Maui, Hawaii", "Cancún, Mexico", "Amalfi Coast, Italy"],
    city: ["Tokyo, Japan", "Barcelona, Spain", "New York City", "London, UK"],
    mixed: ["Lisbon, Portugal", "Vancouver, Canada", "Cape Town, South Africa", "Sydney, Australia"],
  };
  const picks = options[tripType] || options.mixed;
  return picks[Math.floor(Math.random() * picks.length)];
}

function getTripSubtitle(tripType: string, reason: string, duration: number): string {
  const labels: Record<string, string> = {
    forest: "Nature & Mountain Escape",
    beach: "Coastal Paradise",
    city: "Urban Explorer",
    mixed: "The Best of Everything",
  };
  return `${labels[tripType] || "Curated Getaway"} — ${duration} Days of ${reason.charAt(0).toUpperCase() + reason.slice(1)}`;
}

function getHotelName(dest: string, budget: string, tripType: string): string {
  const names: Record<string, string[]> = {
    forest: ["The Mountain Lodge", "Pine Crest Resort", "Alpine Retreat"],
    beach: ["Seaside Resort & Spa", "The Oceanfront", "Coral Bay Hotel"],
    city: ["The Grand Metropolitan", "Urban Luxe Hotel", "City Central Suites"],
    mixed: ["The Horizon Hotel", "Vista Grande", "The Explorer's Lodge"],
  };
  const picks = names[tripType] || names.mixed;
  return picks[Math.floor(Math.random() * picks.length)];
}

function getAlternateHotel(dest: string, budget: string, tripType: string): string {
  const names: Record<string, string[]> = {
    forest: ["Cozy Cabin Airbnb", "Rustic Mountain Chalet"],
    beach: ["Beachfront Villa (Airbnb)", "Coastal Cottage Rentals"],
    city: ["Downtown Loft Airbnb", "Chic City Apartment"],
    mixed: ["Spacious Family Home (Airbnb)", "Modern Condo Rental"],
  };
  const picks = names[tripType] || names.mixed;
  return picks[Math.floor(Math.random() * picks.length)];
}

function getHotelDesc(tripType: string, budget: string): string {
  if (budget === "luxury" || budget === "premium") {
    return "5-star luxury with world-class amenities, spa, and fine dining.";
  }
  if (budget === "budget") {
    return "Comfortable and affordable — clean rooms with great value.";
  }
  return "Well-appointed rooms with excellent service and great location.";
}

function getAlternateHotelDesc(tripType: string, budget: string): string {
  if (budget === "luxury" || budget === "premium") {
    return "Exclusive private villa with pool, full kitchen, and local charm.";
  }
  if (budget === "budget") {
    return "Cozy rental with essential amenities — perfect for budget travelers.";
  }
  return "Spacious rental with home comforts and local character.";
}

function getHotelEmoji(tripType: string): string {
  return tripType === "forest" ? "🏔️" : tripType === "beach" ? "🌊" : tripType === "city" ? "🏙️" : "🌟";
}

function getTripSummary(
  tripType: string,
  dest: string,
  reason: string,
  duration: number,
  adults: number,
  kids: number,
  vibe: string,
): string {
  const groupDesc = kids > 0 ? `${adults} adults and ${kids} kids` : `${adults} adults`;
  const vibeNote = vibe ? ` You're looking for something "${vibe}".` : "";
  return `We've crafted a ${duration}-day itinerary for ${groupDesc} to ${dest}, tailored for a ${reason} trip.${vibeNote} Each day balances must-see highlights with hidden gems, designed to match your travel style and budget.`;
}

function generateDayPlan(
  day: number,
  tripType: string,
  activities: string[],
  dest: string,
  totalDays: number,
): DayPlan {
  const hasHiking = activities.includes("hiking");
  const hasMuseums = activities.includes("museums");
  const hasDining = activities.includes("dining");
  const hasShopping = activities.includes("shopping");
  const hasWater = activities.includes("water");
  const hasRelax = activities.includes("relax");
  const hasNightlife = activities.includes("nightlife");

  const actSets: Record<string, DayPlan> = {
    forest: {
      day,
      title: day === 1 ? "Arrival & Nature Immersion" : day === totalDays ? "Final Exploration & Departure" : "Mountain Adventure",
      activities: [
        { time: "8:00 AM", description: day === 1 ? "Arrive and check into your accommodation" : "Morning hike on scenic trails" },
        { time: "10:00 AM", description: hasHiking ? "Guided nature walk through old-growth forest" : "Explore local nature center" },
        { time: "12:30 PM", description: "Picnic lunch with mountain views" },
        { time: "2:00 PM", description: day === 1 ? "Settle in and explore the grounds" : hasRelax ? "Afternoon spa or hot springs visit" : "Canoeing on the lake" },
        { time: "6:00 PM", description: hasDining ? "Farm-to-table dinner at the lodge restaurant" : "Casual dinner at local tavern" },
        { time: "8:00 PM", description: "Stargazing by the campfire" },
      ],
      meals: [
        { type: "Breakfast", name: "Lodge Café", desc: "Hearty mountain breakfast with fresh pastries", link: "#" },
        { type: "Lunch", name: "Trailside Bistro", desc: "Picnic-style lunch with local ingredients", link: "#" },
        { type: "Dinner", name: "The Forest Table", desc: "Farm-to-table dining experience", link: `https://opentable.com/s/${encodeURIComponent(dest)}` },
      ],
    },
    beach: {
      day,
      title: day === 1 ? "Arrival & Beach Time" : day === totalDays ? "Sunset Farewell" : "Ocean Adventures",
      activities: [
        { time: "8:00 AM", description: day === 1 ? "Arrive and check into your beachfront accommodation" : "Sunrise yoga on the beach" },
        { time: "10:00 AM", description: hasWater ? "Snorkeling or scuba diving session" : "Beach walk and shell collecting" },
        { time: "12:30 PM", description: "Lunch with ocean views" },
        { time: "2:00 PM", description: hasRelax ? "Poolside relaxation and spa treatment" : "Kayaking or paddleboarding" },
        { time: "6:00 PM", description: hasDining ? "Sunset dinner at waterfront restaurant" : "Fresh seafood casual dinner" },
        { time: "8:00 PM", description: hasNightlife ? "Beach bar and live music" : "Evening stroll along the shore" },
      ],
      meals: [
        { type: "Breakfast", name: "Beachfront Café", desc: "Tropical breakfast with fresh fruit", link: "#" },
        { type: "Lunch", name: "The Sand Bar", desc: "Light seafood and refreshing cocktails", link: "#" },
        { type: "Dinner", name: "Sunset Grill", desc: "Waterfront dining with fresh catch of the day", link: `https://opentable.com/s/${encodeURIComponent(dest)}` },
      ],
    },
    city: {
      day,
      title: day === 1 ? "Arrival & City Highlights" : day === totalDays ? "Last Day Discoveries" : "Cultural Immersion",
      activities: [
        { time: "8:00 AM", description: day === 1 ? "Arrive and check into your hotel" : "Visit a local market or bakery for breakfast" },
        { time: "10:00 AM", description: hasMuseums ? "Guided tour of the city's top museum" : "Walking tour of historic district" },
        { time: "12:30 PM", description: hasDining ? "Lunch at a renowned local restaurant" : "Quick bite at a popular food market" },
        { time: "2:00 PM", description: hasShopping ? "Shopping at local boutiques and galleries" : "Visit iconic landmarks and viewpoints" },
        { time: "6:00 PM", description: hasDining ? "Fine dining experience" : "Happy hour at a rooftop bar" },
        { time: "8:00 PM", description: hasNightlife ? "Theater show or nightlife district" : "Evening city walk" },
      ],
      meals: [
        { type: "Breakfast", name: "The Urban Pantry", desc: "Artisan coffee and pastries", link: "#" },
        { type: "Lunch", name: "City Bites", desc: "Trending spot known for local cuisine", link: "#" },
        { type: "Dinner", name: "Metropolitan Table", desc: "Award-winning fine dining experience", link: `https://opentable.com/s/${encodeURIComponent(dest)}` },
      ],
    },
  };

  // Fallback for mixed trip type — blend forest + city
  if (tripType === "mixed") {
    const isEven = day % 2 === 0;
    const base = isEven ? actSets.city : actSets.forest;
    return {
      ...base,
      title: day === 1 ? "Arrival & First Impressions" : day === totalDays ? "Grand Finale" : `${isEven ? "Urban" : "Nature"} Day`,
      meals: [
        { type: "Breakfast", name: "The Local Table", desc: "Start your day with local flavors", link: "#" },
        { type: "Lunch", name: "Midday Market", desc: "Fresh and vibrant lunch options", link: "#" },
        { type: "Dinner", name: "Twilight Kitchen", desc: "Dinner showcasing regional cuisine", link: `https://opentable.com/s/${encodeURIComponent(dest)}` },
      ],
    };
  }

  return actSets[tripType] || actSets.city;
}

function getTips(tripType: string, budget: string, reason: string, dest: string): string[] {
  const tips = [
    `Book your accommodation for ${dest} at least 4 weeks in advance for the best rates.`,
    `Consider travel insurance — especially for ${tripType} trips where weather can be unpredictable.`,
    budget === "budget" ? "Travel during shoulder season for the best deals on flights and hotels." : "Ask about loyalty programs — many hotels offer free perks for direct bookings.",
    reason === "family" ? "Look for hotels with free breakfast and kids-stay-free policies to save." : "Try the local cuisine — ask your hotel concierge for hidden gem restaurants.",
    `Pack layers — even in ${dest}, evenings can be cooler than expected.`,
  ];
  return tips;
}

function ItineraryPage() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try loading from database first
        const surveyId = localStorage.getItem("getaway-survey-id");
        if (surveyId) {
          const dbItinerary = await getItineraryBySurveyId(surveyId);
          if (dbItinerary) {
            const dbSurvey = await getSurveyResponse(surveyId);
            if (dbSurvey) {
              setData(dbSurvey as SurveyData);
              setItinerary(dbItinerary as unknown as Itinerary);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // DB not available - fall through to localStorage
      }

      // Fallback to localStorage
      setTimeout(() => {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const surveyData = JSON.parse(saved) as SurveyData;
            setData(surveyData);
            const result = generateItinerary(surveyData);

            // Try saving generated itinerary to DB in background
            const surveyId = localStorage.getItem("getaway-survey-id");
            if (surveyId && surveyData) {
              saveItinerary({
                surveyId,
                title: result.title,
                subtitle: result.subtitle,
                destinationLabel: result.destinationLabel,
                estimatedCostLabel: result.estimatedCost.label,
                estimatedCostAmount: result.estimatedCost.amount,
                summary: result.summary,
                hotels: result.hotels,
                days: result.days,
                tips: result.tips,
                rawSurvey: surveyData as unknown as Record<string, unknown>,
              }).catch(() => {});
            }

            setItinerary(result);
          }
        } catch {
          // If no data, redirect to survey
        }
        setLoading(false);
      }, 1200);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-bounce">✈️</div>
          <h2 className="text-xl font-semibold text-brand-navy">Crafting your perfect itinerary...</h2>
          <p className="mt-2 text-gray-500">Analyzing your preferences and finding the best options</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-brand-teal" style={{ animationDelay: "0s" }} />
            <div className="h-3 w-3 animate-pulse rounded-full bg-brand-ocean" style={{ animationDelay: "0.2s" }} />
            <div className="h-3 w-3 animate-pulse rounded-full bg-brand-sand" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!data || !itinerary) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <span className="text-5xl">🤷</span>
          <h2 className="mt-4 text-xl font-semibold text-brand-navy">No survey data found</h2>
          <p className="mt-2 text-gray-500">Let's start your trip planning!</p>
          <Link to="/survey" className="btn-primary mt-6 inline-flex">
            Take the Survey
          </Link>
        </div>
      </div>
    );
  }

  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <div className="min-h-dvh py-8">
      <div className="mx-auto max-w-5xl px-4">
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
            {itinerary.title}
          </h1>
          <p className="mt-2 text-gray-500">{itinerary.subtitle}</p>
        </div>

        {/* Summary Card */}
        <div className="card mb-8 overflow-hidden bg-gradient-to-br from-brand-teal/10 via-brand-ocean/5 to-brand-sky/20">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-sm font-medium text-brand-teal backdrop-blur-sm">
                <span>📍</span> {itinerary.destinationLabel}
              </div>
              <p className="mt-3 max-w-2xl text-gray-600 leading-relaxed">
                {itinerary.summary}
              </p>
            </div>
            <div className="rounded-2xl bg-white/70 p-5 text-center backdrop-blur-sm min-w-[180px]">
              <div className="text-sm font-medium text-gray-500">
                {itinerary.estimatedCost.label}
              </div>
              <div className="mt-1 text-3xl font-bold text-brand-teal">
                {itinerary.estimatedCost.amount}
              </div>
              <div className="mt-1 text-xs text-gray-400">per trip (est.)</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/booking" className="btn-primary">
            Book Everything Now
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/survey" className="btn-secondary">
            Edit Preferences
          </Link>
        </div>

        {/* Hotel Suggestions */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-brand-navy">
            🏨 Where to Stay
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {itinerary.hotels.map((hotel, i) => (
              <div key={i} className="card flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal/10 to-brand-ocean/10 text-2xl">
                  {hotel.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-brand-navy">{hotel.name}</h3>
                      <div className="text-sm text-gray-500">
                        {"⭐".repeat(hotel.stars)} {hotel.stars}-star
                      </div>
                    </div>
                    <span className="font-semibold text-brand-teal">{hotel.price}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{hotel.desc}</p>
                  <a
                    href={hotel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-ocean hover:text-brand-teal transition-colors"
                  >
                    Check availability
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Day-by-Day Itinerary */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-brand-navy">
            📅 Your Itinerary
          </h2>
          <div className="space-y-4">
            {itinerary.days.map((day) => (
              <div key={day.day} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal/20 to-brand-ocean/20 text-sm font-bold text-brand-teal">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy">Day {day.day}: {day.title}</h3>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      expandedDay === day.day ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedDay === day.day && (
                  <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                    {/* Activities timeline */}
                    <div className="space-y-3">
                      {day.activities.map((act, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-14 shrink-0 items-center justify-center rounded-md bg-brand-teal/10 text-xs font-medium text-brand-teal">
                            {act.time}
                          </div>
                          <p className="text-sm text-gray-600">{act.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Meals */}
                    <div className="border-t border-gray-100 pt-3">
                      <h4 className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Recommended Dining
                      </h4>
                      <div className="space-y-2">
                        {day.meals.map((meal, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50/50 p-3">
                            <div>
                              <span className="text-xs font-medium uppercase text-gray-400">{meal.type}</span>
                              <div className="font-medium text-brand-navy">{meal.name}</div>
                              <div className="text-sm text-gray-500">{meal.desc}</div>
                            </div>
                            {meal.link !== "#" && (
                              <a
                                href={meal.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-brand-teal shadow-sm hover:bg-brand-teal/5 transition-colors"
                              >
                                Reserve
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10">
          <div className="card bg-gradient-to-br from-brand-cream/50 to-amber-50/50">
            <h2 className="mb-4 text-xl font-bold text-brand-navy">
              💡 Pro Tips
            </h2>
            <ul className="space-y-2">
              {itinerary.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 text-brand-sand">✦</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-brand-navy">
            Ready to Book Your Dream Trip?
          </h2>
          <p className="mt-2 text-gray-500">
            We've found the best options — now lock them in.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/booking" className="btn-primary text-lg">
              🛒 Go to Booking Center
            </Link>
            <Link to="/survey" className="btn-secondary">
              🔄 Start Over
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}