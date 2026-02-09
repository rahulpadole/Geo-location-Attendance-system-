import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [today, setToday] = useState("");
  const [status, setStatus] = useState("Not Marked");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [collegeLat, setCollegeLat] = useState(null);
  const [collegeLng, setCollegeLng] = useState(null);

  const RADIUS = 0.15; // 150m in km

  useEffect(() => {
    const now = new Date();
    setToday(now.toISOString().split("T")[0]);

    loadCollegeSettings();
    checkAttendance();
  }, []);

  // Load college coordinates from Firestore
  const loadCollegeSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "collegeSettings", "main"));
      if (snap.exists()) {
        const data = snap.data();
        setCollegeLat(parseFloat(data.latitude));
        setCollegeLng(parseFloat(data.longitude));
        checkLocation(parseFloat(data.latitude), parseFloat(data.longitude));
      } else {
        setMessage("College settings not found ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to load college settings ❌");
    }
  };

  // Check today's attendance
  const checkAttendance = async () => {
    setLoading(true);
    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", auth.currentUser.uid),
        where("date", "==", todayDate)
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
      setStatus("Error fetching attendance ❌");
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  // Check location against college coordinates
  const checkLocation = (lat = collegeLat, lng = collegeLng) => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported ❌");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!lat || !lng) return setMessage("College coordinates not loaded ❌");

        const dist = getDistanceFromLatLonInKm(
          pos.coords.latitude,
          pos.coords.longitude,
          lat,
          lng
        );

        if (dist <= RADIUS) {
          setMessage("You are inside the college area ✅");
        } else {
          setMessage(`You are outside the college area ❌ (${dist.toFixed(3)} km)`);
        }
      },
      (err) => setMessage("Location error: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h2>Teacher Dashboard</h2>
      <p>Today: {today}</p>
      <p>Attendance Status: <strong>{status}</strong></p>
      <p>{message}</p>

      <div style={{ marginTop: 20 }}>
        <button style={{ marginRight: 10 }} onClick={() => navigate("/teacher/attendance")}>
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

      <div style={{ marginTop: 20 }}>
        <button onClick={() => checkLocation()}>Check My Location</button>
      </div>

      {loading && <p>Loading attendance status...</p>}
    </div>
  );
}
