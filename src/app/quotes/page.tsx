import { LogoutButton } from "@/modules/auth/ui/LogoutButton";
import { QuotesDashboard } from "@/modules/quotes/ui/QuotesDashboard";
import { getAuthOrRedirect } from "@/lib/getAuthOrRedirect";
import { redirect } from "next/navigation";

export default async function Page() {
  const auth = await getAuthOrRedirect();

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
      <QuotesDashboard />
    </div>
  );
}
