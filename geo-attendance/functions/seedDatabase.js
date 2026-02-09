const admin = require("firebase-admin");

// Load service account
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();

async function seedAuthUsers() {
  try {
    console.log("🌱 Seeding Auth users...");

    // 1️⃣ Admin user
    await auth.createUser({
      uid: "admin-uid-001",
      email: "admin@example.com",
      password: "Admin@123",  // You can change password
      displayName: "Rahul Padole",
    });

    // 2️⃣ Teachers
    const teachers = [
      { uid: "teacher-001", email: "john@example.com", password: "Teacher@123", displayName: "John Doe" },
      { uid: "teacher-002", email: "jane@example.com", password: "Teacher@123", displayName: "Jane Smith" },
      { uid: "teacher-003", email: "alice@example.com", password: "Teacher@123", displayName: "Alice Johnson" },
    ];

    for (const t of teachers) {
      await auth.createUser(t);
    }

    console.log("✅ Auth users created successfully!");
  } catch (error) {
    console.error("❌ Error creating Auth users:", error);
  }
}

seedAuthUsers();
