import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Request extra scopes for Google Workspace integration
googleAuthProvider.addScope('openid');
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('https://mail.google.com/');
googleAuthProvider.addScope('https://www.googleapis.com/auth/calendar');
googleAuthProvider.addScope('https://www.googleapis.com/auth/tasks');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.spaces');
googleAuthProvider.addScope('https://www.googleapis.com/auth/classroom.courses');
googleAuthProvider.addScope('https://www.googleapis.com/auth/contacts');
