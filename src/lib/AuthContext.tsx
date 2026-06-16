import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  email: string;
  totalPoints: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        const profileRef = doc(db, 'userProfiles', authUser.uid);
        
        unsubProfile = onSnapshot(profileRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            setDoc(profileRef, {
              email: authUser.email,
              totalPoints: 2521,
              updatedAt: serverTimestamp()
            }).catch(err => handleFirestoreError(err, OperationType.CREATE, `userProfiles/${authUser.uid}`));
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `userProfiles/${authUser.uid}`));
      } else {
        setProfile(null);
        if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
