import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Company, CreateCompanyData } from '@/types/auth';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db instances
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  User as FirebaseAuthUser // Alias User from firebase/auth to avoid conflict
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";

// Export AuthContext so it can be imported elsewhere
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true initially for auth state check
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const fetchedUserData = userDocSnap.data() as Partial<User>; // Treat as partial initially
          const hydratedUser: User = {
            id: fetchedUserData.id || firebaseUser.uid,
            username: fetchedUserData.username || firebaseUser.email || '',
            email: fetchedUserData.email || firebaseUser.email || '',
            role: fetchedUserData.role || 'Employee', // Default role if missing
            companyId: fetchedUserData.companyId || '',
            companyName: fetchedUserData.companyName || '',
            createdAt: fetchedUserData.createdAt || (serverTimestamp() as any), // Use existing or server timestamp for new
            status: fetchedUserData.status || '',
            lastLogin: fetchedUserData.lastLogin || undefined,
            phoneNumber: fetchedUserData.phoneNumber || undefined,
            department: fetchedUserData.department || '',
          };
          setUser(hydratedUser);
          localStorage.setItem('currentUser', JSON.stringify(hydratedUser));
        } else {
          // If user record doesn't exist in Firestore, create a basic one with ICT role
          console.warn("User record not found in Firestore for UID:", firebaseUser.uid, "Creating a basic profile with ICT role.");
          
          let companyId = '';
          let companyName = '';

          // Attempt to find the company this user created, if any, to link the basic profile
          try {
            const companyQuery = query(collection(db, "companies"), where("adminUserId", "==", firebaseUser.uid));
            const companySnapshot = await getDocs(companyQuery);
            if (!companySnapshot.empty) {
              const companyData = companySnapshot.docs[0].data() as Company;
              companyId = companyData.id;
              companyName = companyData.name;
            }
          } catch (error) {
            console.error("Error fetching company for basic profile creation:", error);
          }

          const newUser: User = {
            id: firebaseUser.uid,
            username: firebaseUser.email || '', // Use email as username if available
            email: firebaseUser.email || '',
            role: 'ICT', // Assign ICT role by default for new profiles during initial load
            companyId: companyId,
            companyName: companyName,
            createdAt: serverTimestamp() as any,
            status: '',
            lastLogin: undefined,
            department: '', // Ensure department is initialized
          };
          // Set local state, but don't try to write to Firestore here to avoid race conditions with createCompany
          setUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          console.log("Temporary ICT user profile set for UID:", firebaseUser.uid);
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('currentUser');
      }
      setIsLoading(false);
    });

    // Fetch companies on mount (or you might fetch them as needed)
    const fetchCompanies = async () => {
      try {
        const companiesCollectionRef = collection(db, "companies");
        const companySnapshot = await getDocs(companiesCollectionRef);
        const fetchedCompanies: Company[] = [];
        companySnapshot.forEach(doc => {
          fetchedCompanies.push({ id: doc.id, ...doc.data() } as Company);
        });
        setCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();

    return () => unsubscribe(); // Cleanup auth listener on unmount
  }, []);

  const login = async (companyName: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // First, find the company by name to get its ID
      const companyQuery = query(collection(db, "companies"), where("name", "==", companyName));
      const companySnapshot = await getDocs(companyQuery);

      if (companySnapshot.empty) {
        throw new Error("Company not found.");
      }

      const companyData = companySnapshot.docs[0].data() as Company;
      const companyId = companyData.id;

      // Then, try to sign in the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const firebaseUser = userCredential.user;

      // After successful Firebase auth, fetch user details from Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const fetchedUserData = userDocSnap.data() as Partial<User>;
        // Verify that the user belongs to the specified company
        if (fetchedUserData.companyId !== companyId) {
          await auth.signOut(); // Log out if company mismatch
          throw new Error("User does not belong to this company.");
        }
        const hydratedUser: User = {
          id: fetchedUserData.id || firebaseUser.uid,
          username: fetchedUserData.username || firebaseUser.email || '',
          email: fetchedUserData.email || firebaseUser.email || '',
          role: fetchedUserData.role || 'Employee', // Default role if missing
          companyId: fetchedUserData.companyId || '',
          companyName: fetchedUserData.companyName || '',
          createdAt: fetchedUserData.createdAt || (serverTimestamp() as any),
          status: fetchedUserData.status || '',
          lastLogin: fetchedUserData.lastLogin || undefined,
          phoneNumber: fetchedUserData.phoneNumber || undefined,
          department: fetchedUserData.department || '',
        };
        setUser(hydratedUser);
        localStorage.setItem('currentUser', JSON.stringify(hydratedUser));
      } else {
        // This case should ideally not happen if user creation is correctly handled
        // You might want to delete the Firebase user or log an error here
        await auth.signOut(); // Log out the user if their Firestore record is missing
        throw new Error("User profile not found. Please contact support.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createCompany = async (data: CreateCompanyData) => {
    setIsLoading(true);
    try {
      const batch = writeBatch(db);

      // 1. Create company data and get its ID
      const companiesCollectionRef = collection(db, "companies");
      const newCompanyRef = doc(companiesCollectionRef); // Create a new document reference
      const newCompanyId = newCompanyRef.id; // Get the ID immediately

      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const newCompany: Company = {
        id: newCompanyId,
        name: data.companyName,
        createdAt: serverTimestamp() as any, // Firebase Timestamp
        adminUserId: '', // Will be filled after user creation
        trialEndDate: trialEndDate.toISOString().split('T')[0] // Store as YYYY-MM-DD string
      };

      batch.set(newCompanyRef, newCompany); // Add company to batch

      // 2. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.adminEmail, data.adminPassword);
      const firebaseUser = userCredential.user;

      // Update the newCompany object with adminUserId
      newCompany.adminUserId = firebaseUser.uid;
      batch.set(newCompanyRef, newCompany); // Update company document in batch with adminUserId

      // 3. Create user profile data (linked to Firebase Auth UID and company ID)
      const usersCollectionRef = collection(db, "users");
      const newUserRef = doc(usersCollectionRef, firebaseUser.uid);

      const newUser: User = {
        id: firebaseUser.uid,
        username: data.adminUsername,
        email: data.adminEmail,
        role: 'ICT', // Set as ICT for the company creator as per requirement
        companyId: newCompanyId, // Use the generated company ID
        companyName: newCompany.name,
        createdAt: serverTimestamp() as any,
        status: '',
        lastLogin: undefined,
        department: '', // Ensure department is initialized for the admin user
      };

      batch.set(newUserRef, newUser); // Add user to batch

      console.log('Attempting to commit batch with new company and user documents.');
      await batch.commit();
      console.log('Batch committed successfully.');

      // Update local state and companies list
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCompanies(prev => [...prev, newCompany]);

    } catch (error) {
      console.error("Error creating company and admin user:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanies = () => {
    return companies; // Return companies from state
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      setUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, createCompany, getCompanies, logout, isLoading, auth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
