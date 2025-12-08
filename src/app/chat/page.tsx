import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default async function GuestChatPage() {
  const chatRef = doc(db, "chats", "tEJZRjYU4PDu1lJMNVGz");
  const chatSnap = await getDoc(chatRef);

  const auth = getAuth();

  return (
    <div>
      <h1>chat</h1>

      <h1>{auth.currentUser?.displayName}</h1>

      {chatSnap.exists() ? (
        <div>
          <h1>chat ada</h1>
        </div>
      ) : (
        <div>
          <h1>chat belun</h1>
        </div>
      )}
    </div>
  );
}
