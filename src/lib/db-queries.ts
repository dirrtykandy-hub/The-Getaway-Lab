import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";

// ─── Schema initialization ───

export const initDatabase = createServerFn({ method: "POST" }).handler(async () => {
  const db = sql();
  await db`
    create table if not exists survey_responses (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      destination text default '',
      trip_type text not null default 'mixed',
      duration text not null default '3',
      adults text not null default '2',
      kids text not null default '0',
      budget text not null default 'medium',
      accommodation text not null default 'either',
      star_rating text not null default '3',
      travel_method text not null default 'flight',
      reason text not null default 'relaxation',
      activities jsonb default '[]',
      vibe text default '',
      weather_pref text default '',
      avoid text default '',
      dates text default ''
    );
  `;
  await db`
    create table if not exists itineraries (
      id uuid primary key default gen_random_uuid(),
      survey_id uuid not null references survey_responses(id) on delete cascade,
      created_at timestamptz not null default now(),
      title text not null,
      subtitle text not null,
      destination_label text not null,
      estimated_cost_label text default '',
      estimated_cost_amount text default '',
      summary text default '',
      hotels jsonb default '[]',
      days jsonb default '[]',
      tips jsonb default '[]',
      raw_survey jsonb default '{}'
    );
  `;
  return { ok: true };
});

// ─── Survey responses ───

export type SurveyData = {
  destination: string;
  tripType: string;
  duration: string;
  adults: string;
  kids: string;
  budget: string;
  accommodation: string;
  starRating: string;
  travelMethod: string;
  reason: string;
  activities: string[];
  vibe: string;
  weatherPref: string;
  avoid: string;
  dates: string;
};

export const saveSurveyResponse = createServerFn({ method: "POST" }).handler(async (data: SurveyData) => {
  const db = sql();
  const [row] = await db`
    insert into survey_responses (
      destination, trip_type, duration, adults, kids, budget,
      accommodation, star_rating, travel_method, reason,
      activities, vibe, weather_pref, avoid, dates
    ) values (
      ${data.destination}, ${data.tripType}, ${data.duration},
      ${data.adults}, ${data.kids}, ${data.budget},
      ${data.accommodation}, ${data.starRating}, ${data.travelMethod},
      ${data.reason},
      ${JSON.stringify(data.activities)}, ${data.vibe},
      ${data.weatherPref}, ${data.avoid}, ${data.dates}
    )
    returning id, created_at
  `;
  return { id: String(row.id), createdAt: String(row.created_at) };
});

export const getSurveyResponse = createServerFn({ method: "GET" }).handler(async (id: string) => {
  const db = sql();
  const [row] = await db`select * from survey_responses where id = ${id}`;
  if (!row) return null;
  const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);
  return {
    ...row,
    id: String(row.id),
    created_at: String(row.created_at),
    activities: parse(row.activities),
  };
});

// ─── Itineraries ───

export interface ItineraryData {
  surveyId: string;
  title: string;
  subtitle: string;
  destinationLabel: string;
  estimatedCostLabel: string;
  estimatedCostAmount: string;
  summary: string;
  hotels: unknown[];
  days: unknown[];
  tips: string[];
  rawSurvey: Record<string, unknown>;
}

export const saveItinerary = createServerFn({ method: "POST" }).handler(async (data: ItineraryData) => {
  const db = sql();
  const [row] = await db`
    insert into itineraries (
      survey_id, title, subtitle, destination_label,
      estimated_cost_label, estimated_cost_amount, summary,
      hotels, days, tips, raw_survey
    ) values (
      ${data.surveyId}, ${data.title}, ${data.subtitle},
      ${data.destinationLabel}, ${data.estimatedCostLabel},
      ${data.estimatedCostAmount}, ${data.summary},
      ${JSON.stringify(data.hotels)}, ${JSON.stringify(data.days)},
      ${JSON.stringify(data.tips)}, ${JSON.stringify(data.rawSurvey)}
    )
    returning id, created_at
  `;
  return { id: String(row.id), createdAt: String(row.created_at) };
});

export const getItineraryBySurveyId = createServerFn({ method: "GET" }).handler(async (surveyId: string) => {
  const db = sql();
  const [row] = await db`
    select * from itineraries where survey_id = ${surveyId} order by created_at desc limit 1
  `;
  if (!row) return null;
  const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);
  return {
    ...row,
    id: String(row.id),
    survey_id: String(row.survey_id),
    created_at: String(row.created_at),
    hotels: parse(row.hotels),
    days: parse(row.days),
    tips: parse(row.tips),
    raw_survey: parse(row.raw_survey),
  };
});

// ─── Utility to check if database is connected ───

export const checkDatabase = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = sql();
    await db`select 1 as ok`;
    return { connected: true };
  } catch {
    return { connected: false };
  }
});