import { redirect } from "next/navigation";
import { getAuthOrRedirect } from "@/lib/getAuthOrRedirect";
import { hasPermission } from "@/shared/rbac";
import { LogoutButton } from "@/modules/auth/ui/LogoutButton";
import { QuotesTable } from "@/modules/quotes/ui/QuotesTable";

export default async function Page() {
  const auth = await getAuthOrRedirect();
  if (!hasPermission(auth, "admin:quotes:read")) redirect("/quotes");
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
        <h2 style={{ margin: 0 }}>Admin Quotes</h2>
        <LogoutButton />
      </header>
      <QuotesTable admin />
    </div>
  );
}
