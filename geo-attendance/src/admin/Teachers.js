import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load teachers from Firestore
  const loadTeachers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.role === "teacher"); // Only teachers
      setTeachers(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load teachers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  // Delete a teacher
  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await deleteDoc(doc(db, "users", id));
      alert("✅ Teacher deleted successfully");
      setTeachers(teachers.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete teacher: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 20 }}>
      <h2>Teachers</h2>
      <Link to="/admin/teachers/add">
        <button style={{ marginBottom: 20 }}>➕ Add Teacher</button>
      </Link>

      {loading ? (
        <p>Loading teachers...</p>
      ) : teachers.length === 0 ? (
        <p>No teachers found.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    <button style={{ marginRight: 6 }}>✏️ Edit</button>
                  </Link>
                  <button onClick={() => remove(t.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
