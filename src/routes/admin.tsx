import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  getAllSurveys,
  getSurveyResponse,
  updateSurveyStatus,
  type SurveySummary,
} from "~/lib/db-queries";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const ADMIN_PASSWORD = "getaway2025";

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [surveys, setSurveys] = useState<SurveySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSurveys();
      setSurveys(data);
    } catch {
      // DB not available
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleViewDetails = async (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedSurvey(null);
      return;
    }
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const survey = await getSurveyResponse(id);
      setSelectedSurvey(survey as unknown as Record<string, unknown>);
    } catch {
      setSelectedSurvey(null);
    }
    setDetailLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateSurveyStatus({ id, status });
      setSurveys((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s)),
      );
      if (selectedSurvey && selectedSurvey.id === id) {
        setSelectedSurvey({ ...selectedSurvey, status });
      }
    } catch {
      // Handle error
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="mx-auto max-w-md px-4">
          <div className="card p-8 text-center">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-4 text-2xl font-bold text-brand-navy">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter the admin password to manage survey submissions.
            </p>
            <div className="mt-6">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter password"
                className="input-field text-center"
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-500">Incorrect password. Try again.</p>
              )}
            </div>
            <button onClick={handleLogin} className="btn-primary mt-4 w-full">
              Sign In
            </button>
            <a href="/" className="mt-4 inline-block text-sm text-gray-400 hover:text-brand-teal transition-colors">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh py-8">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">📋 Admin Dashboard</h1>
            <p className="mt-1 text-gray-500">Manage survey submissions and itineraries</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchSurveys}
              className="btn-secondary !px-4 !py-2 !text-sm"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setAuthenticated(false)}
              className="rounded-xl border border-gray-200 bg-white/60 px-4 py-2 text-sm text-gray-500 hover:bg-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {surveys.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-4">
            {["pending", "reviewed", "planned"].map((status) => (
              <div key={status} className="rounded-xl bg-white/60 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="font-semibold text-brand-navy capitalize">{status}</span>:{" "}
                <span className="font-bold text-brand-teal">
                  {surveys.filter((s) => s.status === status).length}
                </span>
              </div>
            ))}
            <div className="rounded-xl bg-white/60 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="font-semibold text-brand-navy">Total</span>:{" "}
              <span className="font-bold text-brand-teal">{surveys.length}</span>
            </div>
          </div>
        )}

        {/* Survey list */}
        {loading ? (
          <div className="text-center py-20">
            <div className="mb-4 text-4xl animate-bounce">📋</div>
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="card text-center py-16">
            <span className="text-5xl">🎉</span>
            <h2 className="mt-4 text-xl font-bold text-brand-navy">No submissions yet</h2>
            <p className="mt-2 text-gray-500">
              Survey submissions will appear here once customers start planning their trips.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <div key={survey.id} className="card overflow-hidden">
                {/* Survey header */}
                <button
                  onClick={() => handleViewDetails(survey.id)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <StatusBadge status={survey.status} />
                    <div>
                      <div className="font-semibold text-brand-navy">
                        {survey.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {survey.destination || "No destination specified"} · {survey.trip_type} · {survey.budget} · {survey.duration} nights
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-gray-400 sm:block">
                      {new Date(survey.created_at).toLocaleDateString()}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        selectedId === survey.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded details */}
                {selectedId === survey.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {detailLoading ? (
                      <p className="text-center text-sm text-gray-400 py-4">Loading details...</p>
                    ) : selectedSurvey ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <DetailField label="Email" value={String(selectedSurvey.email || "")} />
                          <DetailField label="Destination" value={String(selectedSurvey.destination || "Not specified")} />
                          <DetailField label="Trip Type" value={String(selectedSurvey.trip_type || "")} />
                          <DetailField label="Duration" value={`${String(selectedSurvey.duration || "")} nights`} />
                          <DetailField label="Travelers" value={`${String(selectedSurvey.adults || "")} adults, ${String(selectedSurvey.kids || "0")} kids`} />
                          <DetailField label="Budget" value={String(selectedSurvey.budget || "")} />
                          <DetailField label="Accommodation" value={String(selectedSurvey.accommodation || "")} />
                          <DetailField label="Star Rating" value={String(selectedSurvey.star_rating || "")} />
                          <DetailField label="Travel Method" value={String(selectedSurvey.travel_method || "")} />
                          <DetailField label="Reason" value={String(selectedSurvey.reason || "")} />
                          <DetailField label="Vibe" value={String(selectedSurvey.vibe || "Not specified")} />
                          <DetailField label="Weather" value={String(selectedSurvey.weather_pref || "No preference")} />
                          <DetailField label="Avoid" value={String(selectedSurvey.avoid || "Nothing specified")} />
                          <DetailField label="Dates" value={String(selectedSurvey.dates || "Flexible")} />
                          <DetailField label="Activities" value={String(selectedSurvey.activities ? (Array.isArray(selectedSurvey.activities) ? (selectedSurvey.activities as string[]).join(", ") : "None selected") : "None selected")} />
                          <DetailField label="Submitted" value={new Date(String(selectedSurvey.created_at)).toLocaleString()} />
                        </div>

                        {/* Status actions */}
                        <div className="border-t border-gray-100 pt-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Update Status
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {["pending", "reviewed", "planned"].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(survey.id, status)}
                                className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-all ${
                                  survey.status === status
                                    ? status === "pending"
                                      ? "border-amber-400 bg-amber-50 text-amber-700"
                                      : status === "reviewed"
                                        ? "border-blue-400 bg-blue-50 text-blue-700"
                                        : "border-green-400 bg-green-50 text-green-700"
                                    : "border-gray-200 bg-white/60 text-gray-500 hover:border-gray-300"
                                }`}
                              >
                                {status === "pending" ? "⏳ Pending" : status === "reviewed" ? "👁️ Reviewed" : "✅ Planned"}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-400">Failed to load survey details.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    reviewed: "bg-blue-50 text-blue-700 border-blue-200",
    planned: "bg-green-50 text-green-700 border-green-200",
  };
  const labels: Record<string, string> = {
    pending: "⏳ Pending",
    reviewed: "👁️ Reviewed",
    planned: "✅ Planned",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50/50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
}