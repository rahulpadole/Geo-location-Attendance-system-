import { useState, useEffect, useRef } from "react";
import { db, auth } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function MarkAttendance() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [distance, setDistance] = useState(null);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const COLLEGE_LAT = 28.6139; // replace with Firestore value
  const COLLEGE_LNG = 77.209; // replace with Firestore value
  const RADIUS = 0.15; // in km (150m)

  // Start camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Camera error:", err));
  }, []);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const dist = getDistanceFromLatLonInKm(
        pos.coords.latitude,
        pos.coords.longitude,
        COLLEGE_LAT,
        COLLEGE_LNG
      );
      setDistance(dist.toFixed(3));
      if (dist <= RADIUS) {
        setLocationAllowed(true);
        setMessage("You are inside the college area ✅");
      } else {
        setLocationAllowed(false);
        setMessage("You are outside the college area ❌");
      }
    }, err => alert("Location error: " + err.message));
  };

  const takeSelfie = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    setSelfieTaken(true);
    alert("Selfie captured (not saved) ✅");
  };

  const markAttendance = async () => {
    if (!locationAllowed) {
      alert("You must be inside college area to mark attendance");
      return;
    }
    if (!selfieTaken) {
      alert("Please take selfie before marking attendance");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "attendance"), {
        userId: auth.currentUser.uid,
        date: new Date().toISOString().split("T")[0],
        inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Present",
        lateReason: "",
        timestamp: serverTimestamp()
      });
      alert("Attendance marked successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error marking attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>
      <button onClick={checkLocation}>Check Location</button>
      {distance && <p>Distance from college: {distance} km</p>}
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
