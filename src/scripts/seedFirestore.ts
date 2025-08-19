// src/scripts/seedFirestore.ts
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { demoCompany, demoUsers, demoITAssets, demoAssetRequests, demoLeaveRequests } from "../lib/demoData";

// NOTE: This script is intended for LOCAL DEVELOPMENT AND TESTING ONLY.
// It uses client-side Firebase SDK for simplicity in this demo,
// but for production seeding, you should use the Firebase Admin SDK
// in a secure environment (e.g., Cloud Function, dedicated backend server).

// Load Firebase config from environment variables (ensure they are set in .env.local for local testing)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const seedFirestore = async () => {
  console.log("Starting Firestore seeding...");

  try {
    // 1. Authenticate (or create and authenticate) an admin user for seeding
    console.log("Attempting to sign in/create admin user...");
    const adminEmail = demoUsers[0].email; // Assuming the first user is the admin
    const adminPassword = "password123"; // A default password for demo admin
    let adminUid: string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      adminUid = userCredential.user.uid;
      console.log("Signed in as existing admin user.");
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log("Admin user not found, creating new admin user...");
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        adminUid = userCredential.user.uid;
        console.log("New admin user created and signed in.");
      } else {
        throw error;
      }
    }

    // 2. Add Demo Company
    console.log("Adding demo company...");
    const companyQuery = query(collection(db, "companies"), where("name", "==", demoCompany.name));
    const companySnapshot = await getDocs(companyQuery);
    let companyId: string;

    if (companySnapshot.empty) {
      const companyRef = await addDoc(collection(db, "companies"), {
        ...demoCompany,
        adminUserId: adminUid,
        createdAt: serverTimestamp(),
      });
      companyId = companyRef.id;
      console.log(`Demo company added with ID: ${companyId}`);
    } else {
      companyId = companySnapshot.docs[0].id;
      console.log(`Demo company already exists with ID: ${companyId}`);
    }

    // 3. Add Demo Users (Employees)
    console.log("Adding demo users...");
    const usersCollectionRef = collection(db, "users");
    for (const userData of demoUsers) {
      const userQuery = query(usersCollectionRef, where("email", "==", userData.email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        await addDoc(usersCollectionRef, {
          ...userData,
          companyId: companyId,
          companyName: demoCompany.name,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Added user: ${userData.username}`);
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
    }

    // 4. Add Demo IT Assets
    console.log("Adding demo IT assets...");
    const itAssetsCollectionRef = collection(db, "itAssets");
    for (const assetData of demoITAssets) {
      const assetQuery = query(itAssetsCollectionRef, where("serialNumber", "==", assetData.serialNumber));
      const assetSnapshot = await getDocs(assetQuery);
      
      if (assetSnapshot.empty) {
        await addDoc(itAssetsCollectionRef, {
          ...assetData,
          companyId: companyId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Added IT Asset: ${assetData.name}`);
      } else {
        console.log(`IT Asset already exists: ${assetData.name}`);
      }
    }

    // 5. Add Demo Asset Requests
    console.log("Adding demo asset requests...");
    const assetRequestsCollectionRef = collection(db, "assetRequests");
    for (const requestData of demoAssetRequests) {
      // Simple check to prevent duplicate demo data on re-run
      const requestQuery = query(assetRequestsCollectionRef, 
        where("assetId", "==", requestData.assetId),
        where("requester", "==", requestData.requester),
        where("requestType", "==", requestData.requestType)
      );
      const requestSnapshot = await getDocs(requestQuery);

      if (requestSnapshot.empty) {
        await addDoc(assetRequestsCollectionRef, {
          ...requestData,
          companyId: companyId,
          requestDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Added Asset Request for: ${requestData.assetName}`);
      } else {
        console.log(`Asset Request already exists for: ${requestData.assetName}`);
      }
    }

    // 6. Add Demo Leave Requests
    console.log("Adding demo leave requests...");
    const leaveRequestsCollectionRef = collection(db, "leaveRequests");
    for (const leaveData of demoLeaveRequests) {
      // Simple check to prevent duplicate demo data on re-run
      const leaveQuery = query(leaveRequestsCollectionRef, 
        where("employeeName", "==", leaveData.employeeName),
        where("startDate", "==", leaveData.startDate),
        where("leaveType", "==", leaveData.leaveType)
      );
      const leaveSnapshot = await getDocs(leaveQuery);

      if (leaveSnapshot.empty) {
        // Find the employeeId based on employeeName
        const employeeQuery = query(usersCollectionRef, where("username", "==", leaveData.employeeName));
        const employeeSnapshot = await getDocs(employeeQuery);
        let employeeId = "unknown";
        if (!employeeSnapshot.empty) {
          employeeId = employeeSnapshot.docs[0].id;
        }

        await addDoc(leaveRequestsCollectionRef, {
          ...leaveData,
          employeeId: employeeId,
          companyId: companyId,
          appliedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Added Leave Request for: ${leaveData.employeeName}`);
      } else {
        console.log(`Leave Request already exists for: ${leaveData.employeeName}`);
      }
    }

    console.log("Firestore seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding Firestore:", error);
  }
};

seedFirestore();
