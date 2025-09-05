// /lib/firebase.server.ts
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./firebase";


const db = getFirestore(app);

export async function logQAServerEvent(data: Record<string, any>) {
    try {
        await addDoc(collection(db, "qaLogs"), { ...data, ts: serverTimestamp() });
    } catch {
        // no-op in v1; avoid breaking API on logging failures
    }
}

export async function logQuizEvent(data: Record<string, any>) {
    try {
        await addDoc(collection(db, "quizLogs"), { ...data, ts: serverTimestamp() });
    } catch {
        // swallow logging errors
    }
}

export async function logChatEvent(data: Record<string, any>) {
    try {
        await addDoc(collection(db, "chatLogs"), { ...data, ts: serverTimestamp() });
    } catch {
        // ignore logging errors for chat
    }
}
