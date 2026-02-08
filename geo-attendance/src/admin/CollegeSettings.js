import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function CollegeSettings() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "collegeSettings", "main"));
      if (snap.exists()) {
        setLat(snap.data().latitude);
        setLng(snap.data().longitude);
      }
    };
    load();
  }, []);

  const save = async () => {
    await setDoc(doc(db, "collegeSettings", "main"), {
      latitude: lat,
      longitude: lng,
      radius: 150,
    });
    alert("Location saved");
  };

  return (
    <div>
      <h2>College Settings</h2>
      <input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
      <input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
      <button onClick={save}>Save</button>
    </div>
  );
}
