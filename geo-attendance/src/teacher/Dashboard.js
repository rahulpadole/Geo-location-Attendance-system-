import { useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function TeacherDashboard() {
  useEffect(() => {
    const timer = setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 55) {
        const uid = auth.currentUser.uid;
        const today = now.toISOString().split("T")[0];
        const ref = doc(db, "attendance", `${uid}_${today}`);
        const snap = await getDoc(ref);

        if (snap.exists() && !snap.data().outTime) {
          await updateDoc(ref, { outTime: "23:55" });
        }
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return <h2>Teacher Dashboard</h2>;
}
