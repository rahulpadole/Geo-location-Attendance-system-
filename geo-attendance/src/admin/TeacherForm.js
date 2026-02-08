import { useState, useEffect } from "react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams, useNavigate } from "react-router-dom";

export default function TeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (id) {
      getDoc(doc(db, "users", id)).then((snap) => {
        if (snap.exists()) {
          setName(snap.data().name);
          setDepartment(snap.data().department);
        }
      });
    }
  }, [id]);

  const save = async () => {
    if (id) {
      await updateDoc(doc(db, "users", id), { name, department });
    } else {
      await addDoc(collection(db, "users"), {
        name,
        department,
        role: "teacher",
        active: true,
      });
    }
    navigate("/admin/teachers");
  };

  return (
    <div>
      <h2>{id ? "Edit" : "Add"} Teacher</h2>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
      <button onClick={save}>Save</button>
    </div>
  );
}
