import NavButton from "@/components/nav-button";

export default function Home() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <h1>home</h1>

      <NavButton size="lg" href={"/login-kedai"}>
        Login kedai
      </NavButton>

      <NavButton size="lg" href={"/kantin"}>
        Kantin
      </NavButton>

      <NavButton size="lg" href={"/chat"}>
        Chat
      </NavButton>
    </div>
  );
}
