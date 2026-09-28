import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AppShell from "../components/common/AppShell";

// Admin sub-pages
import DashboardOverview from "../components/admin/DashboardOverview";
import StudentList from "../components/admin/StudentList";
import StudentDetail from "../components/admin/StudentDetail";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppShell
      appLabel="S A R S"
      roleLabel="Admin"
      userName={user?.full_name}
      onLogout={handleLogout}
      navVariant="sidebar"
      navItems={[
        {
          to: "/admin",
          label: "Dashboard",
          match: (path) => path === "/admin",
        },
        {
          to: "/admin/students",
          label: "Students",
          match: (path) => path.includes("/admin/students"),
        },
      ]}
    >
      <div className="ds-page-stack">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="students" element={<StudentList />} />
          <Route path="students/:studentId" element={<StudentDetail />} />
        </Routes>
      </div>
    </AppShell>
  );
}

export default AdminDashboard;
