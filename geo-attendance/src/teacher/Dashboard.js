import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [today, setToday] = useState("");
  const [status, setStatus] = useState("Not Marked");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Replace with your college location from Firestore
  const COLLEGE_LAT = 28.6139;
  const COLLEGE_LNG = 77.209;
  const RADIUS = 0.15; // 150m in km

  useEffect(() => {
    const now = new Date();
    setToday(now.toISOString().split("T")[0]);
    checkAttendance();
    checkLocation();
  }, []);

  const checkAttendance = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", auth.currentUser.uid),
        where("date", "==", new Date().toISOString().split("T")[0])
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const record = snap.docs[0].data();
        setStatus(record.status || "Present");
      } else {
        setStatus("Not Marked");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistanceFromLatLonInKm(
          pos.coords.latitude,
          pos.coords.longitude,
          COLLEGE_LAT,
          COLLEGE_LNG
        );

        if (dist <= RADIUS) {
          setMessage("You are inside the college area ✅");
        } else {
          setMessage("You are outside the college area ❌");
        }
      },
      (err) => setMessage("Location error: " + err.message)
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Teacher Dashboard</h2>
      <p>Today: {today}</p>
      <p>Attendance Status: <strong>{status}</strong></p>
      <p>{message}</p>

      <div style={{ marginTop: 20 }}>
        <button
          style={{ marginRight: 10 }}
          onClick={() => navigate("/teacher/attendance")}
        >
          Mark Attendance
        </button>

        <button onClick={() => navigate("/teacher/leave")}>Mark Leave</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/teacher/history")}>Attendance History</button>
        <button style={{ marginLeft: 10 }} onClick={() => navigate("/teacher/profile")}>
          My Profile
        </button>
      </div>

      {loading && <p>Loading attendance status...</p>}
    </div>
  );
}
