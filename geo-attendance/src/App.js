import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* AUTH */
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";

/* ROUTE GUARDS */
import AdminRoute from "./routes/AdminRoute";
import TeacherRoute from "./routes/TeacherRoute";

/* LAYOUT */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

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

/* ---------- Layout Wrappers ---------- */
const TeacherLayout = ({ children }) => (
  <>
    <Navbar role="teacher" />
    <main style={{ minHeight: "80vh" }}>{children}</main>
    <Footer />
  </>
);

const AdminLayout = ({ children }) => (
  <>
    <Navbar role="admin" />
    <main style={{ minHeight: "80vh" }}>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= TEACHER ROUTES ================= */}
        <Route
          path="/teacher/dashboard"
          element={
            <TeacherRoute>
              <TeacherLayout>
                <TeacherDashboard />
              </TeacherLayout>
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/attendance"
          element={
            <TeacherRoute>
              <TeacherLayout>
                <MarkAttendance />
              </TeacherLayout>
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/leave"
          element={
            <TeacherRoute>
              <TeacherLayout>
                <MarkLeave />
              </TeacherLayout>
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/history"
          element={
            <TeacherRoute>
              <TeacherLayout>
                <History />
              </TeacherLayout>
            </TeacherRoute>
          }
        />

        <Route
          path="/teacher/profile"
          element={
            <TeacherRoute>
              <TeacherLayout>
                <TeacherProfile />
              </TeacherLayout>
            </TeacherRoute>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/college-settings"
          element={
            <AdminRoute>
              <AdminLayout>
                <CollegeSettings />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teachers"
          element={
            <AdminRoute>
              <AdminLayout>
                <Teachers />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teachers/add"
          element={
            <AdminRoute>
              <AdminLayout>
                <TeacherForm />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/teachers/edit/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <TeacherForm />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminAttendance />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/export"
          element={
            <AdminRoute>
              <AdminLayout>
                <Export />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AdminLayout>
                <AuditLogs />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
