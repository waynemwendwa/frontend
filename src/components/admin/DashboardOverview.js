import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ds-card" role="status" aria-live="polite">
        <p className="text-slate-400">Loading dashboard metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.total_students || 0,
      icon: UserGroupIcon,
    },
    {
      title: "High Risk",
      value: stats?.high_risk_count || 0,
      onClick: () => navigate("/admin/students?risk=High"),
      icon: ExclamationTriangleIcon,
    },
    {
      title: "Medium Risk",
      value: stats?.medium_risk_count || 0,
      onClick: () => navigate("/admin/students?risk=Medium"),
      icon: ChartBarIcon,
    },
    {
      title: "Low Risk",
      value: stats?.low_risk_count || 0,
      onClick: () => navigate("/admin/students?risk=Low"),
      icon: ShieldCheckIcon,
    },
  ];

  const actionCards = [
    {
      title: "Pending Interventions",
      value: stats?.interventions_pending || 0,
      description: "Interventions awaiting action",
      stateLabel: "Needs review",
    },
    {
      title: "Sent Today",
      value: stats?.interventions_sent_today || 0,
      description: "Interventions sent in last 24h",
      stateLabel: "On track",
    },
  ];

  return (
    <div className="ds-page-stack">
      <div className="ds-section-head">
        <h2>Overview</h2>
        <p>Student engagement and risk metrics for current cohorts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            type="button"
            className={`ds-card text-left ${
              stat.onClick
                ? "cursor-pointer hover:translate-y-[-1px] hover:shadow-lg"
                : ""
            }`}
            aria-label={
              stat.onClick
                ? `Open students filtered by ${stat.title}`
                : stat.title
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-slate-400 text-sm font-semibold">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-100 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionCards.map((card, index) => (
          <div key={index} className="ds-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-slate-100 mt-2">
                  {card.value}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {card.description}
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                {card.stateLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ds-card">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid md:grid-cols-3 gap-10">
          <button
            onClick={() => navigate("/admin/students?risk=High")}
            className="ds-button ds-button-primary"
          >
            View High Risk Students
          </button>
          <button
            onClick={() => navigate("/admin/students")}
            className="ds-button ds-button-primary"
          >
            View All Students
          </button>
          {/* <button className="ds-button ds-button-tertiary">
            Export Report
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
