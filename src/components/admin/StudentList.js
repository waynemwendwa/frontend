/**
 * StudentsList.js
 * Fixed field names to match StudentWithUser response shape:
 *   - name/email live inside student.user (nested object)
 *   - risk score is current_risk_score not risk_score
 *
 * Place at: frontend/src/components/admin/StudentsList.js
 */
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";

function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("risk") || "all");

  useEffect(() => {
    loadStudents();
  }, [filter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { risk_level: filter } : {};
      const data = await adminAPI.getStudents(params);
      setStudents(data);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "High":
        return "bg-red-950/50 text-red-300 border border-red-800";
      case "Medium":
        return "bg-amber-950/50 text-amber-300 border border-amber-800";
      case "Low":
        return "bg-emerald-950/50 text-emerald-300 border border-emerald-800";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  const getRiskBarColor = (level) => {
    switch (level) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-amber-500";
      case "Low":
        return "bg-emerald-500";
      default:
        return "bg-slate-500";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );

  return (
    <div>
      {/* Header + filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Students</h2>
        <div className="flex space-x-2">
          {["all", "High", "Medium", "Low"].map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                filter === level
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700"
              }`}
            >
              {level === "all" ? "All" : `${level} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 shadow rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950">
            <tr>
              {[
                "Student",
                "ID",
                "Risk Score",
                "Risk Level",
                "Last Login",
                "Interventions",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-slate-900 divide-y divide-slate-800">
            {students.map((student) => {
              // ── StudentWithUser shape ──────────────────────────────────────
              // student.user.full_name, student.user.email  (nested)
              // student.current_risk_score                  (not risk_score)
              // student.risk_level
              // student.student_id
              // student.last_login
              // student.interventions_count
              const name = student.user?.full_name || "—";
              const email = student.user?.email || "—";
              const riskScore = student.current_risk_score;
              const riskPct =
                riskScore != null ? (riskScore * 100).toFixed(1) : null;

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-800/60 transition"
                >
                  {/* Name + email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-100">
                      {name}
                    </div>
                    <div className="text-sm text-slate-400">{email}</div>
                  </td>

                  {/* Student ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {student.student_id || "—"}
                  </td>

                  {/* Risk score + mini bar */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-100 mb-1">
                      {riskPct != null ? `${riskPct}%` : "—"}
                    </div>
                    {riskPct != null && (
                      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getRiskBarColor(student.risk_level)}`}
                          style={{ width: `${riskPct}%` }}
                        />
                      </div>
                    )}
                  </td>

                  {/* Risk level badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.risk_level ? (
                      <span
                        className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${getRiskColor(student.risk_level)}`}
                      >
                        {student.risk_level}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Last login */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {student.last_login
                      ? formatDistanceToNow(new Date(student.last_login), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </td>

                  {/* Intervention count */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {student.interventions_count ?? 0}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/admin/students/${student.id}`}
                      className="text-indigo-300 hover:text-indigo-200 font-semibold"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 font-medium">No students found</p>
            <p className="text-slate-500 text-sm mt-1">
              Try changing the risk filter above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsList;
