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
