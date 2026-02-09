import { useState, useEffect, useRef } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

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

  const RADIUS = 0.15; // 150m

  /* ------------------ LOAD COLLEGE SETTINGS ------------------ */
  useEffect(() => {
    loadCollege();
    startCamera();
  }, []);

  const loadCollege = async () => {
    const snap = await getDoc(doc(db, "collegeSettings", "main"));
    if (snap.exists()) {
      setCollegeLat(Number(snap.data().latitude));
      setCollegeLng(Number(snap.data().longitude));
    }
  };

  /* ------------------ CAMERA ------------------ */
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  /* ------------------ LOCATION ------------------ */
  const deg2rad = (deg) => deg * (Math.PI / 180);

  const distanceKm = (a, b, c, d) => {
    const R = 6371;
    const dLat = deg2rad(c - a);
    const dLon = deg2rad(d - b);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(a)) *
        Math.cos(deg2rad(c)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
  };

  const checkLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const dist = distanceKm(
        pos.coords.latitude,
        pos.coords.longitude,
        collegeLat,
        collegeLng
      );

      setDistance(dist.toFixed(3));

      if (dist <= RADIUS) {
        setLocationAllowed(true);
        setMessage("Inside college campus ✅");
      } else {
        setLocationAllowed(false);
        setMessage("Outside college ❌");
      }
    });
  };

  /* ------------------ SELFIE ------------------ */
  const takeSelfie = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    setSelfieTaken(true);
    alert("Selfie captured ✅");
  };

  /* ------------------ LATE CHECK (FIXED) ------------------ */
  const isLate = () => {
    const now = new Date();

    const start = new Date();
    start.setHours(9, 40, 0, 0); // 09:30 + 10 min grace

    return now > start;
  };

  /* ------------------ MARK ATTENDANCE ------------------ */
  const markAttendance = async () => {
    if (!locationAllowed) return alert("Inside college required");
    if (!selfieTaken) return alert("Selfie required");

    const late = isLate();
    let lateReason = "";

    if (late) {
      lateReason = prompt("You are LATE. Enter reason:");
      if (!lateReason || lateReason.trim() === "") {
        return alert("Late reason is mandatory ❌");
      }
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "attendance"), {
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split("T")[0],
        inTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: late ? "Late" : "Present",
        lateReason: lateReason,
        timestamp: serverTimestamp(),
      });

      alert("Attendance marked successfully ✅");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div style={{ maxWidth: 420, margin: "30px auto" }}>
      <h2>Mark Attendance</h2>

      <button onClick={checkLocation}>Check Location</button>
      {distance && <p>Distance: {distance} km</p>}
      <p>{message}</p>

      <video ref={videoRef} width="320" height="240" autoPlay />
      <canvas ref={canvasRef} width="320" height="240" hidden />

      <button onClick={takeSelfie}>Take Selfie</button>

      <button onClick={markAttendance} disabled={loading}>
        {loading ? "Saving..." : "Mark Attendance"}
      </button>
    </div>
  );
}
