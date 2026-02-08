import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* AUTH */
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";

/* ROUTE GUARDS */
import AdminRoute from "./routes/AdminRoute";
import TeacherRoute from "./routes/TeacherRoute";

/* TEACHER */
import TeacherDashboard from "./teacher/Dashboard";
import MarkAttendance from "./teacher/Attendance";
import MarkLeave from "./teacher/Leave";
import History from "./teacher/History";
import TeacherProfile from "./teacher/Profile";

/* ADMIN */
import AdminDashboard from "./admin/Dashboard";
import CollegeSettings from "./admin/CollegeSettings";
import Teachers from "./admin/Teachers";
import TeacherForm from "./admin/TeacherForm";
import AdminAttendance from "./admin/Attendance";
import Export from "./admin/Export";
import AuditLogs from "./admin/AuditLogs";
import AdminProfile from "./admin/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= TEACHER ROUTES ================= */}
        <Route
          path="/teacher/dashboard"
          element={
            <TeacherRoute>
              <TeacherDashboard />
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/attendance"
          element={
            <TeacherRoute>
              <MarkAttendance />
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/leave"
          element={
            <TeacherRoute>
              <MarkLeave />
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/history"
          element={
            <TeacherRoute>
              <History />
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/profile"
          element={
            <TeacherRoute>
              <TeacherProfile />
            </TeacherRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/college-settings"
          element={
            <AdminRoute>
              <CollegeSettings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teachers"
          element={
            <AdminRoute>
              <Teachers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teachers/add"
          element={
            <AdminRoute>
              <TeacherForm />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teachers/edit/:id"
          element={
            <AdminRoute>
              <TeacherForm />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <AdminRoute>
              <AdminAttendance />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/export"
          element={
            <AdminRoute>
              <Export />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AuditLogs />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
