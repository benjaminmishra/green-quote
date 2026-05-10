import { LogoutButton } from "@/modules/auth/ui/LogoutButton";
import { QuotesDashboard } from "@/modules/quotes/ui/QuotesDashboard";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const token = cookies().get("token")?.value;
  if (!token) redirect("/login");
  
  let auth;
  try {
    auth = await verifyToken(token);
  } catch {
    redirect("/login");
  }

  if (auth.role === "ADMIN") {
    redirect("/admin/quotes");
  }

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
        <h2 style={{ margin: 0 }}>My Quotes</h2>
        <LogoutButton />
      </header>
      <QuotesDashboard user={auth} />
    </div>
  );
}
