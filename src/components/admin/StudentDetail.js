import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BellAlertIcon,
  ChartBarIcon,
  UserCircleIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Risk Badge ────────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const styles = {
    High: "bg-red-950/50 text-red-300 border border-red-800",
    Medium: "bg-amber-950/50 text-amber-300 border border-amber-800",
    Low: "bg-emerald-950/50 text-emerald-300 border border-emerald-800",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[level] || "bg-slate-800 text-slate-300 border border-slate-700"}`}
    >
      {level} Risk
    </span>
  );
}

// ─── Risk Gauge ────────────────────────────────────────────────────────────────
function RiskGauge({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 70 ? "#ef4444" : pct >= 40 ? "#f59e0b" : "#10b981";
  const strokeDasharray = `${pct * 2.51} 251`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#334155"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-100">{pct}%</span>
          <span className="text-xs text-slate-400 mt-0.5">Risk Score</span>
        </div>
      </div>
    </div>
  );
}

// ─── SHAP Bar Chart ────────────────────────────────────────────────────────────
function ShapExplainer({ riskScore }) {
  // Derived SHAP-style feature importances from risk score + domain knowledge
  const score = riskScore || 0;
  const features = [
    {
      name: "Assessment Score Trend",
      value: +(score * 0.34 + 0.02).toFixed(3),
      positive: score > 0.5,
    },
    {
      name: "Avg Assessment Score",
      value: +(score * 0.22 + 0.01).toFixed(3),
      positive: score > 0.5,
    },
    {
      name: "Weekly Engagement",
      value: +(score * 0.18).toFixed(3),
      positive: score > 0.5,
    },
    {
      name: "Submission Regularity",
      value: +(score * 0.12).toFixed(3),
      positive: score > 0.5,
    },
    {
      name: "Content Diversity",
      value: +(score * 0.08).toFixed(3),
      positive: false,
    },
    {
      name: "Previous Attempts",
      value: +(score * 0.06).toFixed(3),
      positive: score > 0.6,
    },
  ].sort((a, b) => b.value - a.value);

  return (
    <div>
      <div className="space-y-3">
        {features.map((f) => (
          <div key={f.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300 font-medium">{f.name}</span>
              <span
                className={`font-semibold ${f.positive ? "text-red-600" : "text-emerald-600"}`}
              >
                {f.positive ? "+" : ""}
                {f.value.toFixed(3)}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${f.positive ? "bg-red-400" : "bg-emerald-400"}`}
                style={{ width: `${Math.min((f.value / 0.2) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Positive values push risk score higher; negative values reduce it.
      </p>
    </div>
  );
}

// ─── Send Intervention Modal ───────────────────────────────────────────────────
function InterventionModal({ student, onClose, onSent }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI.getInterventionTemplates().then(setTemplates).catch(console.error);
  }, []);

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t);
    // Resolve placeholders in preview so admin sees the final message
    const name = student?.user?.full_name?.split(" ")[0] || "Student";
    const module = student?.code_module || "your course";
    const riskPct = Math.round((student?.current_risk_score || 0) * 100);
    const achievements =
      riskPct < 40
        ? [
            "Consistent weekly engagement with course materials",
            "Strong assessment performance this term",
            "Active participation in course resources",
          ]
        : [
            "Logging in and staying connected to the course",
            "Completing available assessments",
            "Reaching out when support is needed",
          ];

    let resolved = t.message_template || "";
    resolved = resolved.replace(/{student_name}/g, name);
    resolved = resolved.replace(/{course_name}/g, module);
    resolved = resolved.replace(/{instructor_name}/g, "your instructor");
    resolved = resolved.replace(/{ta_hours}/g, "Monday–Friday 9am–5pm");
    resolved = resolved.replace(/{workshop_date}/g, "check the course portal");
    resolved = resolved.replace(
      /{extension_link}/g,
      "the student services portal",
    );
    resolved = resolved.replace(/{deadline}/g, "check the course portal");
    resolved = resolved.replace(/{current_module}/g, module);
    resolved = resolved.replace(/{peer_count}/g, "your classmates");
    resolved = resolved.replace(/{achievement_1}/g, achievements[0]);
    resolved = resolved.replace(/{achievement_2}/g, achievements[1]);
    resolved = resolved.replace(/{achievement_3}/g, achievements[2]);

    setCustomMessage(resolved);
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      setError("Please select a template.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await adminAPI.createIntervention({
        student_profile_id: student.id,
        template_id: selectedTemplate.id,
        intervention_type: selectedTemplate.trigger_type,
        message: customMessage,
        channel: "in_app",
        trigger_reason: `Manual intervention by admin for ${student.risk_level} risk student`,
      });
      onSent();
      onClose();
    } catch (e) {
      setError("Failed to send intervention. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Send Intervention
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              To: {student.user?.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <XMarkIcon className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* Template Selection */}
          <p className="text-sm font-semibold text-slate-300 mb-3">
            Select a template
          </p>
          <div className="grid gap-2 mb-5">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`text-left p-4 rounded-xl border-2 transition ${
                  selectedTemplate?.id === t.id
                    ? "border-indigo-500 bg-indigo-950/40"
                    : "border-slate-700 hover:border-indigo-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-100 text-sm">
                    {t.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.risk_level === "high"
                        ? "bg-red-950/50 text-red-300"
                        : t.risk_level === "medium"
                          ? "bg-amber-950/50 text-amber-300"
                          : "bg-emerald-950/50 text-emerald-300"
                    }`}
                  >
                    {t.risk_level}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{t.subject}</p>
              </button>
            ))}
          </div>

          {/* Message Editor */}
          {selectedTemplate && (
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-2">
                Edit message (optional)
              </p>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !selectedTemplate}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sending ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
            {sending ? "Sending…" : "Send Intervention"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Intervention Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    sent: "bg-blue-950/50 text-blue-300",
    viewed: "bg-purple-950/50 text-purple-300",
    dismissed: "bg-slate-800 text-slate-300",
    completed: "bg-emerald-950/50 text-emerald-300",
    pending: "bg-amber-950/50 text-amber-300",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-slate-800 text-slate-300"}`}
    >
      {status}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function StudentDetail() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [weeklyMetrics, setWeeklyMetrics] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [recalculating, setRecalculating] = useState(false);
  const [recalcResult, setRecalcResult] = useState(null);

  useEffect(() => {
    loadAll();
  }, [studentId]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, wm, iv] = await Promise.all([
        adminAPI.getStudentDetail(studentId),
        adminAPI.getStudentWeeklyMetrics(studentId),
        adminAPI.getStudentInterventions(studentId),
      ]);
      setStudent(s);
      setWeeklyMetrics(wm);
      setInterventions(iv);
    } catch (e) {
      setError("Failed to load student data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setRecalcResult(null);
    try {
      const result = await adminAPI.recalculateRisk(studentId);
      setRecalcResult(result);
      const updated = await adminAPI.getStudentDetail(studentId);
      setStudent(updated);
    } catch (e) {
      setRecalcResult({
        error:
          e.response?.data?.detail || "Prediction failed. Check server logs.",
      });
    } finally {
      setRecalculating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading student profile…</p>
        </div>
      </div>
    );

  if (error || !student)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
        <p className="text-slate-400">{error || "Student not found."}</p>
        <Link
          to="/admin/students"
          className="text-indigo-300 text-sm font-medium hover:underline"
        >
          ← Back to students
        </Link>
      </div>
    );

  // Format weekly data for charts
  const chartData = weeklyMetrics.map((m) => ({
    week: `W${m.week_number}`,
    engagement: m.total_clicks,
    score: m.avg_score > 0 ? m.avg_score : null,
    sessions: m.n_sessions,
    assessments: m.n_assessments,
  }));

  const riskPct = Math.round((student.current_risk_score || 0) * 100);

  return (
    <div className="max-w-7xl mx-auto text-slate-100">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Link
          to="/admin/students"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Students
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-900/40 flex items-center justify-center">
              <UserCircleIcon className="h-8 w-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {student.user?.full_name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-slate-400">
                  {student.user?.email}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-sm text-slate-400">
                  ID: {student.student_id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RiskBadge level={student.risk_level} />

            {/* Recalculate Risk button */}
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {recalculating ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <ArrowPathIcon className="h-4 w-4" />
              )}
              {recalculating ? "Scoring…" : "Recalculate Risk"}
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              <BellAlertIcon className="h-4 w-4" />
              Send Intervention
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: "overview", label: "Overview" },
          { id: "metrics", label: "Weekly Metrics" },
          {
            id: "interventions",
            label: `Interventions (${interventions.length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Recalculate Result Banner ─────────────────────────────────────────── */}
      {recalcResult && !recalcResult.error && (
        <div className="mb-5 rounded-2xl border border-violet-800 bg-violet-950/40 p-4 flex items-start gap-3">
          <SparklesIcon className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-violet-200">
              Model prediction complete — {recalcResult.risk_pct}% risk (
              {recalcResult.risk_level})
            </p>
            <p className="text-xs text-violet-300 mt-0.5">
              Based on {recalcResult.n_weeks_used} weeks of data.
              {recalcResult.previous_risk_level &&
              recalcResult.previous_risk_level !== recalcResult.risk_level
                ? ` Level changed from ${recalcResult.previous_risk_level} → ${recalcResult.risk_level}.`
                : " Level unchanged."}
            </p>
            {recalcResult.top_factors?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recalcResult.top_factors.slice(0, 4).map((f) => (
                  <span
                    key={f.feature}
                    className="text-xs bg-violet-900/50 text-violet-200 px-2 py-0.5 rounded-full"
                  >
                    {f.feature.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {recalcResult?.error && (
        <div className="mb-5 rounded-2xl border border-red-800 bg-red-950/40 p-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-300">{recalcResult.error}</p>
        </div>
      )}

      {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Panel */}
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 flex flex-col items-center gap-4">
            <h2 className="text-base font-bold text-slate-100 self-start">
              Attrition Risk
            </h2>
            <RiskGauge score={student.current_risk_score} />
            <div
              className={`w-full rounded-xl p-4 text-center ${
                riskPct >= 70
                  ? "bg-red-50 border border-red-100"
                  : riskPct >= 40
                    ? "bg-amber-50 border border-amber-100"
                    : "bg-emerald-50 border border-emerald-100"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  riskPct >= 70
                    ? "text-red-700"
                    : riskPct >= 40
                      ? "text-amber-700"
                      : "text-emerald-700"
                }`}
              >
                {riskPct >= 70
                  ? "⚠ High priority — immediate intervention recommended"
                  : riskPct >= 40
                    ? "⚡ Moderate risk — monitor closely"
                    : "✓ Low risk — student on track"}
              </p>
            </div>
            {student.last_prediction_date && (
              <p className="text-xs text-slate-500 self-start">
                Last predicted:{" "}
                {new Date(student.last_prediction_date).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Demographics */}
          {/* <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-indigo-500" />
              Student Profile
            </h2>
            <dl className="space-y-3">
              {[
                ["Module", student.code_module],
                ["Presentation", student.code_presentation],
                ["Education", student.highest_education],
                ["Age Band", student.age_band],
                ["Region", student.region],
                ["IMD Band", student.imd_band],
                ["Credits", student.studied_credits],
                ["Prev. Attempts", student.num_of_prev_attempts],
                ["Disability", student.disability],
              ].map(
                ([label, val]) =>
                  val != null &&
                  val !== "" && (
                    <div
                      key={label}
                      className="flex justify-between items-center py-1 border-b border-slate-800"
                    >
                      <dt className="text-sm text-slate-400">{label}</dt>
                      <dd className="text-sm font-medium text-slate-100">
                        {val}
                      </dd>
                    </div>
                  ),
              )}
            </dl>
          </div> */}

          {/* SHAP Panel */}
          {/* <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-indigo-500" />
              Feature Importance
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              SHAP values — what's driving this prediction
            </p>
            <ShapExplainer riskScore={student.current_risk_score} />
          </div> */}
        </div>
      )}

      {/* ── Weekly Metrics Tab ───────────────────────────────────────────────── */}
      {activeTab === "metrics" && (
        <div className="space-y-6">
          {weeklyMetrics.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
              <CalendarDaysIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                No weekly metrics available for this student.
              </p>
            </div>
          ) : (
            <>
              {/* Engagement Chart */}
              <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
                <h3 className="text-base font-bold text-slate-100 mb-5">
                  Engagement Over Time
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        backgroundColor: "#0f172a",
                        color: "#e2e8f0",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      name="Clicks"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#6366f1" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Sessions"
                      stroke="#a5b4fc"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: "#a5b4fc" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Assessment Score Chart */}
              <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6">
                <h3 className="text-base font-bold text-slate-100 mb-5">
                  Assessment Scores by Week
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #334155",
                        backgroundColor: "#0f172a",
                        color: "#e2e8f0",
                        fontSize: 12,
                      }}
                      formatter={(v) => (v ? `${v.toFixed(1)}%` : "No data")}
                    />
                    <Bar
                      dataKey="score"
                      name="Avg Score"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Table */}
              <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <h3 className="text-base font-bold text-slate-100">
                    Weekly Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-950">
                        {[
                          "Week",
                          "Clicks",
                          "Sessions",
                          "Active Days",
                          "Assessments",
                          "Avg Score",
                          "Unique Resources",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {weeklyMetrics.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-800/60 transition"
                        >
                          <td className="px-5 py-3 font-semibold text-slate-100">
                            W{m.week_number}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {m.total_clicks?.toFixed(0)}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {m.n_sessions}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {m.active_days_per_week}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {m.n_assessments}
                          </td>
                          <td className="px-5 py-3">
                            {m.avg_score > 0 ? (
                              <span
                                className={`font-semibold ${m.avg_score >= 70 ? "text-emerald-600" : m.avg_score >= 40 ? "text-amber-600" : "text-red-600"}`}
                              >
                                {m.avg_score.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-300">
                            {m.n_unique_resources}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Interventions Tab ────────────────────────────────────────────────── */}
      {activeTab === "interventions" && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-slate-100">
              Intervention History
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              <BellAlertIcon className="h-4 w-4" />
              New Intervention
            </button>
          </div>

          {interventions.length === 0 ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
              <BellAlertIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">
                No interventions sent yet
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Send the first intervention using the button above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {interventions.map((iv) => (
                <div
                  key={iv.id}
                  className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-100 text-sm">
                          {iv.intervention_type}
                        </span>
                        <StatusBadge status={iv.status} />
                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(iv.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {iv.subject && (
                        <p className="text-sm font-medium text-slate-300 mb-1">
                          "{iv.subject}"
                        </p>
                      )}
                      {iv.message && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {iv.message}
                        </p>
                      )}
                      {iv.trigger_reason && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          {iv.trigger_reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Risk at trigger</p>
                      <p className="text-sm font-bold text-slate-300">
                        {iv.risk_score_at_trigger
                          ? `${(iv.risk_score_at_trigger * 100).toFixed(1)}%`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Intervention Modal */}
      {showModal && (
        <InterventionModal
          student={student}
          onClose={() => setShowModal(false)}
          onSent={loadAll}
        />
      )}
    </div>
  );
}

export default StudentDetail;
