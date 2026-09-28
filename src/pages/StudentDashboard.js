import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { studentAPI } from "../services/api";
import AppShell from "../components/common/AppShell";
import {
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  BookOpenIcon,
  BellIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  ClockIcon,
  LightBulbIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sublabel, color = "teal" }) {
  const colors = {
    teal: {
      bg: "bg-teal-900/30",
      icon: "text-teal-300",
      value: "text-teal-300",
    },
    amber: {
      bg: "bg-amber-900/30",
      icon: "text-amber-300",
      value: "text-amber-300",
    },
    indigo: {
      bg: "bg-indigo-900/30",
      icon: "text-indigo-300",
      value: "text-indigo-300",
    },
    rose: {
      bg: "bg-rose-900/30",
      icon: "text-rose-300",
      value: "text-rose-300",
    },
  };
  const c = colors[color];
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 flex items-start gap-4">
      <div className={`${c.bg} rounded-xl p-3 shrink-0`}>
        <Icon className={`h-6 w-6 ${c.icon}`} />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.value}`}>{value}</p>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notification, onDismiss }) {
  const typeStyles = {
    engagement: {
      bg: "bg-teal-950/30 border-teal-800/60",
      accent: "text-teal-300",
    },
    performance: {
      bg: "bg-amber-950/30 border-amber-800/60",
      accent: "text-amber-300",
    },
    resource: {
      bg: "bg-indigo-950/30 border-indigo-800/60",
      accent: "text-indigo-300",
    },
    general: {
      bg: "bg-slate-900 border-slate-700",
      accent: "text-slate-300",
    },
  };
  const style =
    typeStyles[notification.intervention_type] || typeStyles.general;
  const isNew = notification.status === "sent";

  return (
    <div className={`relative rounded-2xl border p-5 ${style.bg} transition`}>
      {isNew && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
      )}
      <div className="flex items-start gap-3 pr-4">
        <span className="text-2xl">{style.icon}</span>
        <div className="flex-1">
          {notification.subject && (
            <p className={`font-semibold text-sm ${style.accent} mb-1`}>
              {notification.subject}
            </p>
          )}
          <p className="text-sm text-slate-300">{notification.message}</p>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(notification.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(notification.id)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-800 hover:shadow-sm transition"
          title="Dismiss"
        >
          <XMarkIcon className="h-4 w-4 text-slate-500" />
        </button>
      )}
    </div>
  );
}

function ResourceCard({ resource }) {
  const priorityColor = {
    high: "border-l-4 border-teal-400",
    medium: "border-l-4 border-amber-400",
    low: "border-l-4 border-slate-700",
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5 ${priorityColor[resource.priority] || "border-l-4 border-slate-700"}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-slate-100 text-sm">
          {resource.title}
        </h4>
        {resource.priority === "high" && (
          <span className="text-xs bg-teal-900/40 text-teal-300 px-2 py-0.5 rounded-full font-medium">
            Recommended
          </span>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-3">{resource.description}</p>
      {resource.action && (
        <button className="text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 transition">
          {resource.action} →
        </button>
      )}
    </div>
  );
}

// ─── Engagement trend label ────────────────────────────────────────────────────
function TrendPill({ trend }) {
  const map = {
    improving: { label: "↑ Improving", classes: "bg-teal-100 text-teal-700" },
    steady: { label: "→ Steady", classes: "bg-amber-100 text-amber-700" },
    "building momentum": {
      label: "⚡ Building momentum",
      classes: "bg-indigo-100 text-indigo-700",
    },
  };
  const t = map[trend] || {
    label: trend,
    classes: "bg-slate-800 text-slate-300",
  };
  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${t.classes}`}
    >
      {t.label}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, prog, res, notifData] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getProgress(),
        studentAPI.getResources(),
        studentAPI.getNotifications(),
      ]);
      setProfile(p);
      setProgress(prog);
      setResources(Array.isArray(res) ? res : res.recommendations || []);

      // Backend returns { notifications: [...], unread_count: N }
      const notifList =
        notifData?.notifications || (Array.isArray(notifData) ? notifData : []);
      setNotifications(notifList);
      setUnreadCount(
        notifData?.unread_count ?? notifList.filter((n) => n.is_new).length,
      );
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await studentAPI.dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Dismiss failed:", e);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );

  // Build chart data from recent activity
  const activityData = (progress?.recent_activity || []).map((w) => ({
    week: `Week ${w.week}`,
    engagement: w.clicks || 0,
    score: w.score || null,
  }));

  // Motivational greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "there";

  // Compute a "streak" indicator from active weeks (just show weeks_active)
  const activeWeeks = progress?.weeks_active || 0;
  const avgScore = progress?.average_score;
  const totalEngagement = progress?.total_engagement || 0;

  return (
    <AppShell
      appLabel="S A R S"
      roleLabel="Student"
      userName={user?.full_name}
      onLogout={handleLogout}
      navItems={[
        {
          to: "/student",
          label: "Dashboard",
          match: (path) => path === "/student",
        },
      ]}
    >
      <Routes>
        <Route
          index
          element={
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              {/* ── Welcome Banner ───────────────────────────────────────────────── */}
              <div className="mb-8 bg-gradient-to-r from-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 right-20 h-24 w-24 rounded-full bg-white/5" />

                <div className="relative">
                  <p className="text-teal-200 text-sm font-medium mb-1">
                    {greeting}!
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {user?.full_name}
                  </h1>
                  <p className="text-teal-100 text-sm max-w-md">
                    {progress?.engagement_trend === "improving"
                      ? "You're making great progress — keep the momentum going!"
                      : progress?.engagement_trend === "steady"
                        ? "You're staying consistent. Small steps every day add up to big results."
                        : "Every session counts. You're building great study habits!"}
                  </p>

                  {progress && (
                    <div className="mt-4">
                      <TrendPill trend={progress.engagement_trend} />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Stats Row ────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon={FireIcon}
                  label="Active Weeks"
                  value={activeWeeks}
                  sublabel="weeks engaged"
                  color="teal"
                />
                <StatCard
                  icon={TrophyIcon}
                  label="Avg Score"
                  value={avgScore ? `${avgScore.toFixed(1)}%` : "—"}
                  sublabel={
                    avgScore >= 70
                      ? "Great work!"
                      : avgScore
                        ? "Keep going!"
                        : "Assessments pending"
                  }
                  color="amber"
                />
                <StatCard
                  icon={ChartBarIcon}
                  label="Total Activities"
                  value={totalEngagement.toLocaleString()}
                  sublabel="resources explored"
                  color="indigo"
                />
                <StatCard
                  icon={AcademicCapIcon}
                  label="Module"
                  value={profile?.code_module || "—"}
                  sublabel={profile?.code_presentation || ""}
                  color="rose"
                />
              </div>

              {/* ── Tabs ─────────────────────────────────────────────────────────── */}
              <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 shadow-sm p-1 rounded-2xl w-fit">
                {[
                  { id: "overview", label: "My Progress" },
                  { id: "resources", label: "Resources" },
                  {
                    id: "notifications",
                    label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-teal-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Overview Tab ─────────────────────────────────────────────────── */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Engagement Chart */}
                  {activityData.length > 0 ? (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-100">
                          Your Recent Activity
                        </h3>
                        <span className="text-xs text-slate-500">
                          Last {activityData.length} weeks
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart
                          data={activityData}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="engGrad"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#14b8a6"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="95%"
                                stopColor="#14b8a6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                          />
                          <XAxis
                            dataKey="week"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                          />
                          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "1px solid #334155",
                              backgroundColor: "#0f172a",
                              color: "#e2e8f0",
                              fontSize: 12,
                            }}
                            formatter={(v, name) => [
                              v,
                              name === "engagement" ? "Activities" : "Score",
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="engagement"
                            name="Activities"
                            stroke="#14b8a6"
                            strokeWidth={2.5}
                            fill="url(#engGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-10 text-center">
                      <ChartBarIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">
                        No activity data yet
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        Start engaging with your course materials to see your
                        progress here.
                      </p>
                    </div>
                  )}

                  {/* Motivational tips */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-teal-950/40 to-teal-900/30 rounded-2xl p-5 border border-teal-800/70">
                      <div className="flex items-center gap-2 mb-2">
                        <LightBulbIcon className="h-5 w-5 text-teal-600" />
                        <h4 className="font-bold text-teal-800 text-sm">
                          Study Tip
                        </h4>
                      </div>
                      <p className="text-sm text-teal-700">
                        Students who engage with course materials at least 3
                        times a week tend to score significantly higher on
                        assessments. Try setting a daily 30-minute study block!
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-950/40 to-indigo-900/30 rounded-2xl p-5 border border-indigo-800/70">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-bold text-indigo-800 text-sm">
                          Performance Insight
                        </h4>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {avgScore && avgScore >= 70
                          ? `Your average score of ${avgScore.toFixed(1)}% is excellent! Keep up the great work.`
                          : avgScore
                            ? `Reviewing assessment feedback and re-reading key sections can push your score above 70%.`
                            : `Completing assessments regularly is one of the biggest predictors of success in this module.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Resources Tab ────────────────────────────────────────────────── */}
              {activeTab === "resources" && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <BookOpenIcon className="h-5 w-5 text-teal-600" />
                    <h3 className="font-bold text-slate-100">
                      Personalised for You
                    </h3>
                  </div>

                  {resources.length === 0 ? (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
                      <SparklesIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">
                        No recommendations yet
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        Check back after engaging with some course materials.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {resources.map((r, i) => (
                        <ResourceCard key={i} resource={r} />
                      ))}
                    </div>
                  )}

                  {/* General resources always shown */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">
                      General Resources
                    </h4>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        {
                          title: "Study Skills Guide",
                          desc: "Time management, note-taking strategies",
                        },
                        {
                          title: "Peer Study Groups",
                          desc: "Connect with fellow students",
                        },
                        {
                          title: "Goal Setting",
                          desc: "Set and track your academic goals",
                        },
                      ].map((r) => (
                        <div
                          key={r.title}
                          className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex gap-3 items-start hover:shadow-sm transition cursor-pointer"
                        >
                          <span className="text-2xl">{r.icon}</span>
                          <div>
                            <p className="font-semibold text-slate-100 text-sm">
                              {r.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {r.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Notifications Tab ────────────────────────────────────────────── */}
              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <BellIcon className="h-5 w-5 text-teal-600" />
                      <h3 className="font-bold text-slate-100">
                        Messages from Your Tutor
                      </h3>
                    </div>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-teal-900/40 text-teal-300 font-semibold px-3 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center">
                      <CheckCircleIcon className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">
                        You're all caught up!
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        No new messages from your tutor at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <NotificationCard
                          key={n.id}
                          notification={n}
                          onDismiss={handleDismiss}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </AppShell>
  );
}

export default StudentDashboard;
