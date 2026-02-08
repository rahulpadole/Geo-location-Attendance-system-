import { auth, db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function MarkLeave() {
  const leave = async () => {
    const uid = auth.currentUser.uid;
    const today = new Date().toISOString().split("T")[0];
    const time = new Date().toTimeString().slice(0, 5);

    await updateDoc(doc(db, "attendance", `${uid}_${today}`), {
      outTime: time,
    });

    alert("Leave time recorded");
  };

  return (
    <div>
      <h2>Mark Leave</h2>
      <button onClick={leave}>Confirm Leave</button>
    </div>
  );
}
