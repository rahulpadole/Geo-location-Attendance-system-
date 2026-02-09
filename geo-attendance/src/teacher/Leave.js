import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

export default function MarkLeave() {
  const [loading, setLoading] = useState(false);

  const leave = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const today = new Date().toISOString().split("T")[0];
      const time = new Date().toTimeString().slice(0, 5);
      const attendanceRef = doc(db, "attendance", `${uid}_${today}`);

      const docSnap = await getDoc(attendanceRef);

      if (docSnap.exists()) {
        // Update existing attendance
        await updateDoc(attendanceRef, {
          outTime: time,
        });
      } else {
        // Create new attendance document if not exists
        await setDoc(attendanceRef, {
          userId: uid,
          date: today,
          inTime: "",
          outTime: time,
          status: "Absent",
          lateReason: "",
          timestamp: serverTimestamp(),
        });
      }

      alert("✅ Leave time recorded successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to mark leave: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", textAlign: "center" }}>
      <h2>Mark Leave</h2>
      <button onClick={leave} disabled={loading}>
        {loading ? "Processing..." : "Confirm Leave"}
      </button>
    </div>
  );
}
