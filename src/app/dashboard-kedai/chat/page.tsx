import { auth } from "@/config/auth";

export default async function OwnerChatPage() {
  const session = await auth();

  return (
    <div>
      <h1>halo </h1>
    </div>
  );
}
