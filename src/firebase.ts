import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyD6ngYFqsgRTmTrOS1vdX6RGg6MkTogdBc",
  authDomain: "tastaholic.firebaseapp.com",
  projectId: "tastaholic",
  storageBucket: "tastaholic.firebasestorage.app",
  messagingSenderId: "380005556778",
  appId: "1:380005556778:web:2f09d104781023761dd953",
  measurementId: "G-J7YLJ57G2S"
};
// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Firestore
export const db = getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Keep track of the actual RecaptchaVerifier instance to clear it if needed
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Set up reCAPTCHA verifier and send OTP SMS
 */
export async function setUpRecaptcha(phoneNumber: string) {
  try {
    // Destroy existing recaptcha verifier to avoid multiple mounting errors
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (err) {
        console.warn("Could not clear previous RecaptchaVerifier:", err);
      }
      recaptchaVerifier = null;
    }

    const parentContainer = document.getElementById("recaptcha-container");
    if (!parentContainer) {
      throw new Error("HTML container element 'recaptcha-container' must be in the DOM");
    }
    // Clear any previous captcha widgets
    parentContainer.innerHTML = "";

    // Dynamically append a fresh container child to avoid "reCAPTCHA already rendered" errors
    const childDiv = document.createElement("div");
    childDiv.id = "recaptcha-widget-mount-" + Date.now();
    parentContainer.appendChild(childDiv);

    recaptchaVerifier = new RecaptchaVerifier(auth, childDiv, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved automatically
      },
    });
    
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Error setting up reCAPTCHA or sending OTP:", error);
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (_) {}
      recaptchaVerifier = null;
    }
    throw error;
  }
}

/**
 * Log out the current user session
 */
export async function logOut() {
  try {
    // Clear any resilient sandbox fallbacks
    localStorage.removeItem("tastaholic_fallback_uid");
    await signOut(auth);
    window.dispatchEvent(new Event("tastaholic-auth-change"));
  } catch (error) {
    console.error("Error signing out from Firebase:", error);
    localStorage.removeItem("tastaholic_fallback_uid");
    window.dispatchEvent(new Event("tastaholic-auth-change"));
    throw error;
  }
}

export interface SessionUser {
  uid: string;
  name: string;
  phoneNumber: string | null;
  isAnonymous: boolean;
}

/**
 * Get active session user (Firebase auth or resilient fallback)
 */
export function getCurrentSessionUser(): SessionUser | null {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    const cachedName = localStorage.getItem(`tastaholic_name_${firebaseUser.uid}`) || firebaseUser.displayName;
    return {
      uid: firebaseUser.uid,
      name: cachedName || "Valued Customer",
      phoneNumber: firebaseUser.phoneNumber,
      isAnonymous: firebaseUser.isAnonymous,
    };
  }

  // Check fallback session
  const fallbackUid = localStorage.getItem("tastaholic_fallback_uid");
  if (fallbackUid) {
    const cachedName = localStorage.getItem(`tastaholic_name_${fallbackUid}`);
    return {
      uid: fallbackUid,
      name: cachedName || "Sandbox Explorer",
      phoneNumber: "+919999900000",
      isAnonymous: true,
    };
  }

  return null;
}
