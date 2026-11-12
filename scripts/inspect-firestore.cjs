const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "prime-housing-72330"
});

const db = admin.firestore();

async function inspect() {
  const collections = await db.listCollections();

  console.log("\nFIRESTORE COLLECTION REPORT\n");

  for (const collection of collections) {
    const snapshot = await collection.get();

    console.log("--------------------------------");
    console.log("Collection:", collection.id);
    console.log("Documents:", snapshot.size);

    snapshot.forEach((doc) => {
      console.log("Document ID:", doc.id);
      console.log("Data:", doc.data());
    });
  }
}

inspect().catch(console.error);