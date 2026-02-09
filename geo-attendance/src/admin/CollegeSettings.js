import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CollegeSettings() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  // Load existing college settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "collegeSettings", "main"));
        if (snap.exists()) {
          const data = snap.data();
          setLat(data.latitude || "");
          setLng(data.longitude || "");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Failed to load college settings");
      }
    };
    loadSettings();
  }, []);

  // Save settings to Firestore
  const save = async () => {
    if (!lat || !lng) {
      alert("Please provide valid coordinates.");
      return;
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "collegeSettings", "main"), {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius: 150, // in meters
      });
      alert("✅ College location saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving location!");
    } finally {
      setLoading(false);
    }
  };

  // Get current user location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = parseFloat(position.coords.latitude.toFixed(6));
        const currentLng = parseFloat(position.coords.longitude.toFixed(6));
        setLat(currentLat);
        setLng(currentLng);

        if (lat && lng) {
          const dist = getDistanceFromLatLonInKm(currentLat, currentLng, lat, lng);
          setDistance(dist.toFixed(3));
        }
      },
      (error) => {
        console.error(error);
        alert("Failed to get current location");
      },
      { enableHighAccuracy: true }
    );
  };

  // Calculate distance in km between two coordinates
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
    <>
      <Navbar role="admin" />
      <div style={{ maxWidth: 400, margin: "20px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>College Settings</h2>

        <div style={{ marginBottom: 10 }}>
          <label>Latitude:</label>
          <input
            type="number"
            step="0.000001"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            style={{ width: "100%", padding: 6, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Longitude:</label>
          <input
            type="number"
            step="0.000001"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            style={{ width: "100%", padding: 6, marginTop: 4 }}
          />
        </div>

        <button onClick={useCurrentLocation} style={{ marginBottom: 10 }}>
          📍 Use Current Location
        </button>

        {distance !== null && <p>Distance from selected location: {distance} km</p>}

        <button onClick={save} disabled={loading}>
          {loading ? "Saving..." : "Save Location"}
        </button>
      </div>
      <Footer />
    </>
  );
}
