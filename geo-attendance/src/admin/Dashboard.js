import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [collegeStatus, setCollegeStatus] = useState("");
  const navigate = useNavigate();

  const COLLEGE_LAT = 28.6139; // Example, replace with Firestore value
  const COLLEGE_LNG = 77.209;
  const RADIUS = 0.15; // 150 meters in km

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total teachers
      const teachersSnap = await getDocs(collection(db, "users"));
      const teachers = teachersSnap.docs.map((d) => d.data()).filter(u => u.role === "teacher");
      setTotalTeachers(teachers.length);

      // Today's attendance
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

      // College location status
      if (teachers.length > 0) {
        const dist = getDistanceFromLatLonInKm(COLLEGE_LAT, COLLEGE_LNG, COLLEGE_LAT, COLLEGE_LNG);
        setCollegeStatus(dist <= RADIUS ? "Location Set ✅" : "Location Not Set ❌");
      } else {
        setCollegeStatus("No teachers available");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching stats: " + err.message);
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", textAlign: "center" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 30 }}>
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <h3>Total Teachers</h3>
          <p>{totalTeachers}</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <h3>Today Present</h3>
          <p>{todayPresent}</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <h3>Late Count</h3>
          <p>{lateCount}</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
          <h3>College Status</h3>
          <p>{collegeStatus}</p>
        </div>
      </div>

      <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/admin/college-settings")}>College Settings</button>
        <button onClick={() => navigate("/admin/teachers")}>Teacher Management</button>
        <button onClick={() => navigate("/admin/attendance")}>Attendance Records</button>
        <button onClick={() => navigate("/admin/export")}>Export</button>
        <button onClick={() => navigate("/admin/audit-logs")}>Audit Logs</button>
        <button onClick={() => navigate("/admin/profile")}>My Profile</button>
      </div>
    </div>
  );
}
