import { LogoutButton } from "@/modules/auth/ui/LogoutButton";

export default function Page() {
  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>Quote Details</h2>
        <LogoutButton />
      </header>
      <div>Quote details loaded from /api/quotes/:id</div>
    </div>
  );
}
