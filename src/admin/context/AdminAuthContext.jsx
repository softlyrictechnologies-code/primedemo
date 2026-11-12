import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.js';

const AdminAuthContext = createContext(null);

export function getSafeAdminDiagnostics(user = auth.currentUser, tokenClaims = {}) {
  const claimValue = tokenClaims?.admin ?? null;
  const fallbackRole = tokenClaims?.role === 'admin' || tokenClaims?.role === 'super_admin' ? true : null;
  const adminClaimValue = claimValue ?? fallbackRole;
  const hasAdminClaim = Boolean(
    tokenClaims?.admin === true ||
      tokenClaims?.superAdmin === true ||
      ['admin', 'super_admin', 'super-admin'].includes(tokenClaims?.role)
  );
  const hasSuperAdminClaim = Boolean(
    tokenClaims?.superAdmin === true ||
      ['super_admin', 'super-admin'].includes(tokenClaims?.role)
  );

  return {
    uid: user?.uid ?? null,
    email: user?.email ?? null,
    projectId: auth?.app?.options?.projectId || 'prime-housing-72330',
    hasAdminClaim,
    hasSuperAdminClaim,
    adminClaimValue,
    isAuthenticated: Boolean(user),
  };
}

export function AdminAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [diagnostics, setDiagnostics] = useState(getSafeAdminDiagnostics(null, {}));

  const checkAdminPrivileges = async (user) => {
    if (!user) {
      setCurrentUser(null);
      setAdminProfile(null);
      setIsAdmin(false);
      setRole(null);
      setIsSuperAdmin(false);
      setClaims(null);
      setDiagnostics(getSafeAdminDiagnostics(null, {}));
      setLoading(false);
      return false;
    }

    try {
      const idTokenResult = await user.getIdTokenResult(true).catch(() => null);
      const tokenClaims = idTokenResult?.claims || {};
      setClaims(tokenClaims);

      let profileData = null;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          profileData = userDocSnap.data();
          setAdminProfile(profileData);
        }
      } catch (err) {
        console.warn('[AdminAuth] Could not fetch user profile:', err.message);
      }

      let isAdminDoc = false;
      try {
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          isAdminDoc = true;
          if (adminDocSnap.data()?.role) profileData = { ...profileData, role: adminDocSnap.data().role };
        }
      } catch (err) {
        // Ignored
      }

      const roleValue = tokenClaims.admin === true || tokenClaims.superAdmin === true ||
        ['admin', 'super_admin', 'super-admin'].includes(tokenClaims.role) || isAdminDoc
        ? 'admin'
        : (profileData?.role || tokenClaims.role || null);
      const hasAdminClaim = Boolean(
        tokenClaims.admin === true ||
          tokenClaims.superAdmin === true ||
          ['admin', 'super_admin', 'super-admin'].includes(tokenClaims.role) ||
          isAdminDoc
      );
      const hasSuperAdminClaim = Boolean(
        tokenClaims.superAdmin === true || ['super_admin', 'super-admin'].includes(tokenClaims.role)
      );
      const adminVerified = Boolean(
        tokenClaims.admin === true || tokenClaims.superAdmin === true ||
        ['admin', 'super_admin', 'super-admin'].includes(tokenClaims.role) ||
        (isAdminDoc && roleValue === 'admin')
      );
      const staffVerified = adminVerified || ['editor', 'support'].includes(roleValue);

      setCurrentUser(user);
      setAdminProfile(profileData);
      setIsAdmin(adminVerified);
      setRole(roleValue);
      setIsSuperAdmin(hasSuperAdminClaim);
      setDiagnostics(getSafeAdminDiagnostics(user, tokenClaims));
      setLoading(false);
      return staffVerified;
    } catch (err) {
      console.error('[AdminAuth] Error checking admin privileges:', err);
      setCurrentUser(user);
      setAdminProfile(null);
      setIsAdmin(false);
      setRole(null);
      setIsSuperAdmin(false);
      setClaims(null);
      setDiagnostics(getSafeAdminDiagnostics(user, {}));
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        await checkAdminPrivileges(user);
      } else {
        setCurrentUser(null);
        setAdminProfile(null);
        setIsAdmin(false);
        setRole(null);
        setIsSuperAdmin(false);
        setClaims(null);
        setDiagnostics(getSafeAdminDiagnostics(null, {}));
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailInput, passwordInput) => {
    setAuthError(null);
    setLoading(true);

    const email = (emailInput || '').trim().toLowerCase();
    const password = (passwordInput || '').trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);
      const isVerifiedAdminClaim = Boolean(
        tokenResult?.claims?.admin === true ||
          tokenResult?.claims?.superAdmin === true ||
          ['admin', 'super_admin', 'super-admin'].includes(tokenResult?.claims?.role)
      );
      const hasStaffRole = ['admin', 'editor', 'support'].includes(tokenResult?.claims?.role);

      let isAdminDoc = false;
      if (!isVerifiedAdminClaim) {
        try {
          const adminDocSnap = await getDoc(doc(db, 'admins', userCredential.user.uid));
          if (adminDocSnap.exists()) {
            isAdminDoc = true;
          }
        } catch (e) {
          // Ignore
        }
      }

      if (!isVerifiedAdminClaim && !hasStaffRole && !isAdminDoc) {
        const err = new Error(
          'Access Denied: Your account does not have verified administrator privileges. Firebase custom claim admin=true or role=admin is required.'
        );
        setAuthError(err.message);
        throw err;
      }

      const isVerified = await checkAdminPrivileges(userCredential.user);

      if (!isVerified) {
        const err = new Error(
          'Access Denied: Your account does not have verified administrator privileges.'
        );
        setAuthError(err.message);
        throw err;
      }

      return userCredential.user;
    } catch (error) {
      console.error('[AdminAuth] Login error:', error);
      let userFriendlyMessage = 'Invalid email or password. Please verify your credentials.';

      if (error.code === 'auth/too-many-requests') {
        userFriendlyMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.message && error.message.includes('Access Denied')) {
        userFriendlyMessage = error.message;
      }

      setAuthError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAdminProfile(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setClaims(null);
      setAuthError(null);
      setDiagnostics(getSafeAdminDiagnostics(null, {}));
    } catch (error) {
      console.error('[AdminAuth] Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminStatus = async () => {
    if (auth.currentUser) {
      setLoading(true);
      return await checkAdminPrivileges(auth.currentUser);
    }
    return isAdmin;
  };

  const value = {
    currentUser,
    adminProfile,
    isAdmin,
    role,
    isAuthorized: isAdmin || role === 'editor' || role === 'support',
    isSuperAdmin,
    claims,
    diagnostics,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    refreshAdminStatus,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }

  return context;
}
