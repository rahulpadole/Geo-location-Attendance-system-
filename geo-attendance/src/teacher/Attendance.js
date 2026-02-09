import { useState, useEffect, useRef } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

export default function MarkAttendance() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [distance, setDistance] = useState(null);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [collegeLat, setCollegeLat] = useState(null);
  const [collegeLng, setCollegeLng] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const RADIUS = 0.15; // km (150 m)

  // Load college coordinates from Firestore and start camera
  useEffect(() => {
    const loadCollegeSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "collegeSettings", "main"));
        if (snap.exists()) {
          const data = snap.data();
          setCollegeLat(parseFloat(data.latitude));
          setCollegeLng(parseFloat(data.longitude));
        } else {
          alert("College settings not found!");
        }
      } catch (err) {
        console.error("Failed to load college settings:", err);
      }
    };

    loadCollegeSettings();

    // Start camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();
  }, []);

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

  // Check user's location
  const checkLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (collegeLat === null || collegeLng === null) {
          return alert("College coordinates not loaded yet");
        }

        const dist = getDistanceFromLatLonInKm(
          pos.coords.latitude,
          pos.coords.longitude,
          collegeLat,
          collegeLng
        );

        setDistance(dist.toFixed(3));
        if (dist <= RADIUS) {
          setLocationAllowed(true);
          setMessage("You are inside the college area ✅");
        } else {
          setLocationAllowed(false);
          setMessage("You are outside the college area ❌");
        }
      },
      (err) => alert("Location error: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  // Capture selfie
  const takeSelfie = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    setSelfieTaken(true);
    alert("Selfie captured ✅");
  };

  // Save attendance
  const markAttendance = async () => {
    if (!locationAllowed) return alert("You must be inside college area to mark attendance");
    if (!selfieTaken) return alert("Please take selfie before marking attendance");

    setLoading(true);
    try {
      await addDoc(collection(db, "attendance"), {
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split("T")[0],
        inTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Present",
        lateReason: "",
        timestamp: serverTimestamp(),
      });
      alert("Attendance marked successfully ✅");

      // Reset
      setSelfieTaken(false);
      setLocationAllowed(false);
      setDistance(null);
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Error marking attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Mark Attendance</h2>

      <button onClick={checkLocation}>Check Location</button>
      {distance !== null && <p>Distance from college: {distance} km</p>}
      <p>{message}</p>

      <div>
        <video ref={videoRef} width="320" height="240" autoPlay></video>
        <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }}></canvas>
      </div>

      <button onClick={takeSelfie}>Take Selfie</button>
      <button onClick={markAttendance} disabled={loading}>
        {loading ? "Marking..." : "Mark Attendance"}
      </button>
    </div>
  );
}
