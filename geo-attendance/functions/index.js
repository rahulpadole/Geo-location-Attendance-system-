const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.deleteOldAttendance = functions.pubsub
    .schedule("every 24 hours")
    .timeZone("Asia/Kolkata")
    .onRun(async () => {
      const now = new Date();

      const cutoff = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 40,
      );

      const cutoffDate = cutoff.toISOString().split("T")[0];

      const snapshot = await db
          .collection("attendance")
          .where("date", "<", cutoffDate)
          .get();

      if (snapshot.empty) {
        console.log("No old attendance records found");
        return null;
      }

      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Deleted ${snapshot.size} old attendance records`);
      return null;
    });
