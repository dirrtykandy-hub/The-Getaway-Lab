import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const sql = neon(url);

  // Test connection
  const test = await sql`select 1 as ok`;
  console.log("Connected:", JSON.stringify(test));

  // Create survey_responses table
  await sql`
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
  console.log("survey_responses table ready");

  // Create itineraries table
  await sql`
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
  console.log("itineraries table ready");

  // Migration: add email and status columns
  await sql`alter table survey_responses add column if not exists email text not null default ''`;
  console.log("email column added");
  await sql`alter table survey_responses add column if not exists status text not null default 'pending'`;
  console.log("status column added");

  console.log("Database initialization complete!");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});