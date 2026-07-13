import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";

export const Route = createFileRoute("/survey")({
  component: SurveyPage,
});

type TripType = "forest" | "beach" | "city" | "mixed";
type AccomType = "hotel" | "airbnb" | "either";

interface SurveyData {
  destination: string;
  tripType: TripType;
  duration: string;
  adults: string;
  kids: string;
  budget: string;
  accommodation: AccomType;
  starRating: string;
  travelMethod: string;
  reason: string;
  activities: string[];
  vibe: string;
  weatherPref: string;
  avoid: string;
  dates: string;
}

const defaultSurvey: SurveyData = {
  destination: "",
  tripType: "mixed",
  duration: "3",
  adults: "2",
  kids: "0",
  budget: "medium",
  accommodation: "either",
  starRating: "3",
  travelMethod: "flight",
  reason: "relaxation",
  activities: [],
  vibe: "",
  weatherPref: "",
  avoid: "",
  dates: "",
};

const STORAGE_KEY = "getaway-survey";

const steps = [
  { label: "Basics", emoji: "📋" },
  { label: "Budget", emoji: "💰" },
  { label: "Style", emoji: "🎨" },
  { label: "Destination", emoji: "📍" },
  { label: "Travel", emoji: "🚗" },
  { label: "Review", emoji: "✅" },
];

const tripTypes: { value: TripType; label: string; emoji: string; desc: string }[] = [
  { value: "forest", label: "Forest & Outdoors", emoji: "🌲", desc: "Mountains, trails, national parks" },
  { value: "beach", label: "Beach Getaway", emoji: "🏖️", desc: "Sandy shores, ocean, sunsets" },
  { value: "city", label: "City Explorer", emoji: "🌆", desc: "Museums, dining, nightlife" },
  { value: "mixed", label: "Mixed Adventure", emoji: "🎲", desc: "A bit of everything" },
];

const activityOptions = [
  { value: "hiking", label: "Hiking & Nature", emoji: "🥾" },
  { value: "museums", label: "Museums & Culture", emoji: "🏛️" },
  { value: "dining", label: "Fine Dining", emoji: "🍽️" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "water", label: "Water Sports", emoji: "🏄" },
  { value: "nightlife", label: "Nightlife & Bars", emoji: "🌙" },
  { value: "history", label: "Historical Sites", emoji: "🏰" },
  { value: "relax", label: "Relaxation & Spa", emoji: "🧖" },
  { value: "family", label: "Family Activities", emoji: "🎠" },
  { value: "adventure", label: "Adventure Sports", emoji: "🧗" },
  { value: "photography", label: "Photography", emoji: "📸" },
  { value: "wildlife", label: "Wildlife & Safari", emoji: "🦁" },
];

const budgetOptions = [
  { value: "budget", label: "Budget-Friendly", emoji: "💰", desc: "Under $100/night" },
  { value: "medium", label: "Mid-Range", emoji: "💵", desc: "$100-$250/night" },
  { value: "luxury", label: "Luxury", emoji: "💎", desc: "$250-$500/night" },
  { value: "premium", label: "Premium", emoji: "👑", desc: "$500+/night" },
];

const travelMethods = [
  { value: "flight", label: "✈️ Flight" },
  { value: "drive", label: "🚗 Drive" },
  { value: "train", label: "🚆 Train" },
  { value: "bus", label: "🚌 Bus" },
  { value: "any", label: "🤷 Open to anything" },
];

const reasons = [
  { value: "anniversary", label: "💕 Anniversary" },
  { value: "family", label: "👨‍👩‍👧‍👦 Family Vacation" },
  { value: "adventure", label: "🧗 Adventure" },
  { value: "relaxation", label: "🧘 Relaxation" },
  { value: "romantic", label: "🌹 Romantic Getaway" },
  { value: "solo", label: "🧑 Solo Travel" },
  { value: "friends", label: "🎉 With Friends" },
  { value: "work", label: "💼 Work + Leisure" },
];

function SurveyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SurveyData>(defaultSurvey);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData({ ...defaultSurvey, ...parsed });
      }
    } catch {}
  }, []);

  // Save data on change
  const updateData = useCallback((patch: Partial<SurveyData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleActivity = useCallback(
    (value: string) => {
      setData((prev) => {
        const activities = prev.activities.includes(value)
          ? prev.activities.filter((a) => a !== value)
          : [...prev.activities, value];
        const next = { ...prev, activities };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const nextStep = useCallback(() => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const prevStep = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const generateItinerary = useCallback(() => {
    navigate({ to: "/itinerary" });
  }, [navigate]);

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return data.duration !== "" && data.adults !== "";
      case 1:
        return data.budget !== "";
      case 2:
        return true;
      case 3:
        return data.vibe !== "";
      case 4:
        return data.travelMethod !== "" && data.reason !== "";
      case 5:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-dvh py-8">
      <div className="mx-auto max-w-3xl px-4">
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
          <h1 className="text-3xl font-bold text-brand-navy">Plan Your Getaway</h1>
          <p className="mt-2 text-gray-500">
            Tell us what you love — we'll build the perfect itinerary.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center">
                <div
                  className={`step-indicator ${
                    i === step
                      ? "step-active"
                      : i < step
                        ? "step-completed"
                        : "step-upcoming"
                  }`}
                >
                  {i < step ? "✓" : s.emoji}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    i === step
                      ? "text-brand-teal"
                      : i < step
                        ? "text-brand-teal/60"
                        : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress line */}
          <div className="relative mt-2 h-1 rounded-full bg-gray-200">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-ocean transition-all duration-500"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="card p-8">
          {step === 0 && (
            <StepBasics data={data} updateData={updateData} />
          )}
          {step === 1 && (
            <StepBudget data={data} updateData={updateData} />
          )}
          {step === 2 && (
            <StepStyle data={data} updateData={updateData} toggleActivity={toggleActivity} />
          )}
          {step === 3 && (
            <StepDestination data={data} updateData={updateData} />
          )}
          {step === 4 && (
            <StepTravel data={data} updateData={updateData} />
          )}
          {step === 5 && (
            <StepReview data={data} generateItinerary={generateItinerary} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="btn-secondary !px-6 !py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-primary !px-6 !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Trip Basics ─── */

function StepBasics({
  data,
  updateData,
}: {
  data: SurveyData;
  updateData: (p: Partial<SurveyData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">📋</span>
        <h2 className="mt-3 text-2xl font-bold text-brand-navy">Trip Basics</h2>
        <p className="mt-1 text-gray-500">Let's start with the essentials</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          How many nights? *
        </label>
        <select
          value={data.duration}
          onChange={(e) => updateData({ duration: e.target.value })}
          className="input-field"
        >
          <option value="1">1 night (Weekend trip)</option>
          <option value="2">2 nights</option>
          <option value="3">3 nights</option>
          <option value="4">4 nights</option>
          <option value="5">5 nights</option>
          <option value="7">1 week</option>
          <option value="10">10 nights</option>
          <option value="14">2 weeks</option>
          <option value="21">3 weeks+</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Adults *
          </label>
          <select
            value={data.adults}
            onChange={(e) => updateData({ adults: e.target.value })}
            className="input-field"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Kids
          </label>
          <select
            value={data.kids}
            onChange={(e) => updateData({ kids: e.target.value })}
            className="input-field"
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            When are you going?
          </label>
          <input
            type="text"
            value={data.dates}
            onChange={(e) => updateData({ dates: e.target.value })}
            placeholder="e.g. June 2025 or Dec 15-22"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Budget & Accommodation ─── */

function StepBudget({
  data,
  updateData,
}: {
  data: SurveyData;
  updateData: (p: Partial<SurveyData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">💰</span>
        <h2 className="mt-3 text-2xl font-bold text-brand-navy">Budget & Stays</h2>
        <p className="mt-1 text-gray-500">Set your budget and preference</p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          What's your budget range? *
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {budgetOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateData({ budget: opt.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                data.budget === opt.value
                  ? "border-brand-teal bg-brand-teal/5 shadow-md"
                  : "border-gray-200 bg-white/50 hover:border-gray-300"
              }`}
            >
              <div className="text-lg">
                {opt.emoji} <span className="font-semibold text-brand-navy">{opt.label}</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Where would you like to stay?
        </label>
        <div className="flex gap-3">
          {[
            { value: "hotel" as const, label: "🏨 Hotel" },
            { value: "airbnb" as const, label: "🏡 Airbnb / Rental" },
            { value: "either" as const, label: "🤷 Either is fine" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateData({ accommodation: opt.value })}
              className={`flex-1 rounded-xl border-2 p-3 text-center transition-all ${
                data.accommodation === opt.value
                  ? "border-brand-teal bg-brand-teal/5 shadow-md"
                  : "border-gray-200 bg-white/50 hover:border-gray-300"
              }`}
            >
              <span className="font-medium text-brand-navy">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {data.accommodation === "hotel" || data.accommodation === "either" ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Preferred hotel star rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateData({ starRating: String(star) })}
                className={`rounded-xl border-2 px-4 py-2 transition-all ${
                  data.starRating === String(star)
                    ? "border-brand-teal bg-brand-teal/5 shadow-md"
                    : "border-gray-200 bg-white/50 hover:border-gray-300"
                }`}
              >
                <span className="text-lg">
                  {"⭐".repeat(star)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Step 3: Trip Type & Activities ─── */

function StepStyle({
  data,
  updateData,
  toggleActivity,
}: {
  data: SurveyData;
  updateData: (p: Partial<SurveyData>) => void;
  toggleActivity: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">🎨</span>
        <h2 className="mt-3 text-2xl font-bold text-brand-navy">Trip Style</h2>
        <p className="mt-1 text-gray-500">What kind of experience are you after?</p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Trip type *
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {tripTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => updateData({ tripType: type.value })}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                data.tripType === type.value
                  ? "border-brand-teal bg-brand-teal/5 shadow-md"
                  : "border-gray-200 bg-white/50 hover:border-gray-300"
              }`}
            >
              <div className="text-xl">
                {type.emoji} <span className="font-semibold text-brand-navy">{type.label}</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          What do you want to do? (pick all that apply)
        </label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {activityOptions.map((act) => (
            <button
              key={act.value}
              onClick={() => toggleActivity(act.value)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 transition-all ${
                data.activities.includes(act.value)
                  ? "border-brand-teal bg-brand-teal/5 shadow-sm"
                  : "border-gray-200 bg-white/50 hover:border-gray-300"
              }`}
            >
              <span>{act.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{act.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 4: Destination & Vibe ─── */

function StepDestination({
  data,
  updateData,
}: {
  data: SurveyData;
  updateData: (p: Partial<SurveyData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">📍</span>
        <h2 className="mt-3 text-2xl font-bold text-brand-navy">Destination & Vibe</h2>
        <p className="mt-1 text-gray-500">Where do you want to go?</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Do you have a specific destination in mind?
        </label>
        <input
          type="text"
          value={data.destination}
          onChange={(e) => updateData({ destination: e.target.value })}
          placeholder="e.g. Paris, Tokyo, Bali, or leave blank for suggestions"
          className="input-field"
        />
        <p className="mt-1 text-xs text-gray-400">
          If you're not sure, we'll suggest the perfect place based on your preferences.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Describe the vibe you're looking for *
        </label>
        <textarea
          value={data.vibe}
          onChange={(e) => updateData({ vibe: e.target.value })}
          placeholder="e.g. Romantic and quiet, family-friendly and fun, adventurous and wild, peaceful and relaxing..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Weather preference
          </label>
          <select
            value={data.weatherPref}
            onChange={(e) => updateData({ weatherPref: e.target.value })}
            className="input-field"
          >
            <option value="">No preference</option>
            <option value="warm">☀️ Warm & sunny</option>
            <option value="cool">🌤️ Cool & mild</option>
            <option value="cold">❄️ Cold / Snowy</option>
            <option value="tropical">🌴 Tropical</option>
            <option value="any">🤷 Any weather is fine</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Places to avoid
          </label>
          <input
            type="text"
            value={data.avoid}
            onChange={(e) => updateData({ avoid: e.target.value })}
            placeholder="e.g. Crowded cities, tourist traps"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 5: Travel Details ─── */

function StepTravel({
  data,
  updateData,
}: {
  data: SurveyData;
  updateData: (p: Partial<SurveyData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">🚗</span>
        <h2 className="mt-3 text-2xl font-bold text-brand-navy">Travel Details</h2>
        <p className="mt-1 text-gray-500">How will you get there and why?</p>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Preferred travel method *
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {travelMethods.map((method) => (
            <button
              key={method.value}
              onClick={() => updateData({ travelMethod: method.value })}
              className={`rounded-xl border-2 p-3 text-center transition-all ${
                data.travelMethod === method.value
                  ? "border-brand-teal bg-brand-teal/5 shadow-md"
                  : "border-gray-200 bg-white/50 hover:border-gray-300"
              }`}
            >
              <span className="font-medium text-brand-navy text-sm">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          What's the reason for this trip? *
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {reasons.map((reason) => (
            <button
              key={reason.value}
              onClick={() => updateData({ reason: reason.value })}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                data.reason === reason.value
                  ? "border-brand-teal bg-brand-teal/5 shadow-md"
                  : "border-gray-200 bg-white/50 hover:border-gray-300"
              }`}
            >
              <span className="font-medium text-brand-navy">{reason.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 6: Review ─── */

function StepReview({
  data,
  generateItinerary,
}: {
  data: SurveyData;
  generateItinerary: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">✅</span>
        <h2 className="mt-3 text-2xl font-bold text-brand-navy">Review & Generate</h2>
        <p className="mt-1 text-gray-500">
          Here's a summary of your preferences. Ready to see your itinerary?
        </p>
      </div>

      <div className="space-y-3 rounded-xl bg-gradient-to-br from-brand-sky/30 to-brand-cream/30 p-6">
        <ReviewRow label="Duration" value={`${data.duration} nights`} />
        <ReviewRow
          label="Travelers"
          value={`${data.adults} adult${Number(data.adults) !== 1 ? "s" : ""}${
            Number(data.kids) > 0 ? ` + ${data.kids} kid${Number(data.kids) !== 1 ? "s" : ""}` : ""
          }`}
        />
        <ReviewRow label="Dates" value={data.dates || "Flexible"} />
        <ReviewRow
          label="Trip Type"
          value={tripTypes.find((t) => t.value === data.tripType)?.label || data.tripType}
        />
        <ReviewRow
          label="Budget"
          value={budgetOptions.find((b) => b.value === data.budget)?.label || data.budget}
        />
        <ReviewRow
          label="Accommodation"
          value={
            data.accommodation === "hotel"
              ? `Hotel (${"⭐".repeat(Number(data.starRating))})`
              : data.accommodation === "airbnb"
                ? "Airbnb / Rental"
                : "Either"
          }
        />
        <ReviewRow
          label="Activities"
          value={
            data.activities.length > 0
              ? data.activities
                  .map((a) => activityOptions.find((o) => o.value === a)?.emoji + " " + activityOptions.find((o) => o.value === a)?.label)
                  .join(", ")
              : "Open to suggestions"
          }
        />
        <ReviewRow
          label="Destination"
          value={data.destination || "We'll suggest one!"}
        />
        <ReviewRow label="Vibe" value={data.vibe} />
        <ReviewRow
          label="Travel Method"
          value={travelMethods.find((m) => m.value === data.travelMethod)?.label || data.travelMethod}
        />
        <ReviewRow
          label="Reason"
          value={reasons.find((r) => r.value === data.reason)?.label || data.reason}
        />
      </div>

      <div className="text-center">
        <button onClick={generateItinerary} className="btn-primary text-lg">
          ✨ Generate My Itinerary
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="min-w-[120px] text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}