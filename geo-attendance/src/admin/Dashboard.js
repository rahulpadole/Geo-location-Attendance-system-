import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AdminDashboard() {
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [collegeStatus, setCollegeStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1️⃣ Total teachers
      const teachersSnap = await getDocs(collection(db, "users"));
      const teachers = teachersSnap.docs.map((d) => d.data()).filter(u => u.role === "teacher");
      setTotalTeachers(teachers.length);

      // 2️⃣ Today's attendance
      const todayDate = new Date().toISOString().split("T")[0];
      const attSnap = await getDocs(
        query(collection(db, "attendance"), where("date", "==", todayDate))
      );

      let present = 0;
      let late = 0;
      attSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === "Present") present++;
        if (data.lateReason) late++;
      });
      setTodayPresent(present);
      setLateCount(late);

      // 3️⃣ College location status from Firestore
      const collegeSnap = await getDoc(doc(db, "collegeSettings", "main"));
      if (collegeSnap.exists()) {
        const data = collegeSnap.data();
        setCollegeStatus(data.latitude && data.longitude ? "Location Set ✅" : "Location Not Set ❌");
      } else {
        setCollegeStatus("Location Not Set ❌");
      }
    } catch (err) {
      console.error(err);
      setCollegeStatus("Error loading data ❌");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading stats...</p>;

  return (
    <>
      <Navbar role="admin" />
      <div style={{ maxWidth: 900, margin: "40px auto", textAlign: "center" }}>
        <h2>Admin Dashboard</h2>

        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 30, flexWrap: "wrap", gap: "20px" }}>
          <StatCard title="Total Teachers" value={totalTeachers} />
          <StatCard title="Today Present" value={todayPresent} />
          <StatCard title="Late Count" value={lateCount} />
          <StatCard title="College Status" value={collegeStatus} />
        </div>

        <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
          <NavButton label="College Settings" onClick={() => navigate("/admin/college-settings")} />
          <NavButton label="Teacher Management" onClick={() => navigate("/admin/teachers")} />
          <NavButton label="Attendance Records" onClick={() => navigate("/admin/attendance")} />
          <NavButton label="Export" onClick={() => navigate("/admin/export")} />
          <NavButton label="Audit Logs" onClick={() => navigate("/admin/audit-logs")} />
          <NavButton label="My Profile" onClick={() => navigate("/admin/profile")} />
        </div>
      </div>
      <Footer />
    </>
  );
}

// --------------------------
// Reusable small card component
function StatCard({ title, value }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: 20,
      borderRadius: 8,
      minWidth: 150,
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h3>{title}</h3>
      <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>{value}</p>
    </div>
  );
}

// --------------------------
// Reusable button component
function NavButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        borderRadius: 6,
        background: "#1976d2",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      {label}
    </button>
  );
}
