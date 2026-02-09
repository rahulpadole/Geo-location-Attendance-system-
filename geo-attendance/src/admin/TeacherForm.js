import { useState, useEffect } from "react";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams, useNavigate } from "react-router-dom";

export default function TeacherForm() {
  const { id } = useParams(); // teacher doc id (for edit)
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // Load teacher when editing
  useEffect(() => {
    if (!id) return;

    const loadTeacher = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", id));
        if (!snap.exists()) {
          alert("Teacher not found");
          navigate("/admin/teachers");
          return;
        }
        const data = snap.data();
        setName(data.name || "");
        setDepartment(data.department || "");
      } catch (err) {
        console.error(err);
        alert("Failed to load teacher");
      } finally {
        setLoading(false);
      }
    };

    loadTeacher();
  }, [id, navigate]);

  // Save teacher
  const saveTeacher = async () => {
    if (!name.trim() || !department.trim()) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        // Update
        await updateDoc(doc(db, "users", id), {
          name: name.trim(),
          department: department.trim(),
        });
        alert("✅ Teacher updated");
      } else {
        // Create
        await addDoc(collection(db, "users"), {
          name: name.trim(),
          department: department.trim(),
          role: "teacher",
          active: true,
          createdAt: new Date(),
        });
        alert("✅ Teacher added");
      }

      navigate("/admin/teachers");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "30px auto" }}>
      <h2>{id ? "Edit Teacher" : "Add Teacher"}</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Teacher Name"
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Department"
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <button
        onClick={saveTeacher}
        disabled={loading}
        style={{ padding: "10px 18px", cursor: "pointer" }}
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
