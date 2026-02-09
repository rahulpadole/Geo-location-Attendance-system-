import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AdminTimetable() {
  const [day, setDay] = useState("monday");
  const [startTime, setStartTime] = useState("");
  const [lateAfter, setLateAfter] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load timetable when day changes
  useEffect(() => {
    loadTimetable(day);
  }, [day]);

  const loadTimetable = async (selectedDay) => {
    setMessage("");
    try {
      const ref = doc(db, "timetable", selectedDay);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setStartTime(data.startTime || "");
        setLateAfter(data.lateAfter || "");
        setEndTime(data.endTime || "");
      } else {
        setStartTime("");
        setLateAfter("");
        setEndTime("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error loading timetable");
    }
  };

  const validate = () => {
    if (!startTime || !lateAfter || !endTime) {
      return "All fields are required";
    }
    if (!(startTime < lateAfter && lateAfter < endTime)) {
      return "Time order must be: Start < Late After < End";
    }
    return null;
  };

  const saveTimetable = async () => {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await setDoc(doc(db, "timetable", day), {
        startTime,
        lateAfter,
        endTime,
        updatedAt: new Date(),
      });

      setMessage("Timetable saved successfully ✅");
    } catch (err) {
      console.error(err);
      setMessage("Error saving timetable ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>College Timetable Settings</h2>

      <label>Day</label>
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        style={{ width: "100%", marginBottom: 15 }}
      >
        {DAYS.map((d) => (
          <option key={d} value={d}>
            {d.toUpperCase()}
          </option>
        ))}
      </select>

      <label>College Start Time</label>
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        style={{ width: "100%", marginBottom: 15 }}
      />

      <label>Late After</label>
      <input
        type="time"
        value={lateAfter}
        onChange={(e) => setLateAfter(e.target.value)}
        style={{ width: "100%", marginBottom: 15 }}
      />

      <label>College End Time</label>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        style={{ width: "100%", marginBottom: 20 }}
      />

      <button
        onClick={saveTimetable}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : "Save Timetable"}
      </button>

      {message && (
        <p style={{ marginTop: 15, textAlign: "center" }}>{message}</p>
      )}
    </div>
  );
}
