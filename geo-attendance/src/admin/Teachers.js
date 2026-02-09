import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load teachers
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === "teacher");
      setTeachers(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Delete teacher
  const removeTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      alert("Teacher deleted ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to delete teacher");
    }
  };

  return (
    <div>
      <h2>Teacher Management</h2>

      <Link to="/admin/teachers/add">
        <button>➕ Add Teacher</button>
      </Link>

      {loading ? (
        <p>Loading...</p>
      ) : teachers.length === 0 ? (
        <p>No teachers found</p>
      ) : (
        <table border="1" cellPadding="6" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.department}</td>
                <td>
                  <Link to={`/admin/teachers/edit/${t.id}`}>
                    <button>✏️ Edit</button>
                  </Link>{" "}
                  <button onClick={() => removeTeacher(t.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
