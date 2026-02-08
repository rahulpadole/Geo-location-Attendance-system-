import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "users"));
      setTeachers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const remove = async (id) => {
    await deleteDoc(doc(db, "users", id));
    setTeachers(teachers.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h2>Teachers</h2>
      <Link to="/admin/teachers/add">Add Teacher</Link>
      <ul>
        {teachers.map((t) => (
          <li key={t.id}>
            {t.name} - {t.department}
            <Link to={`/admin/teachers/edit/${t.id}`}>Edit</Link>
            <button onClick={() => remove(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
