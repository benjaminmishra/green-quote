import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { hasPermission } from "@/shared/rbac";
import { LogoutButton } from "@/modules/auth/ui/LogoutButton";
import { QuotesTable } from "@/modules/quotes/ui/QuotesTable";

export default async function Page() {
  const token = cookies().get("token")?.value;
  if (!token) redirect("/login");
  try {
    const auth = await verifyToken(token!);
    if (!hasPermission(auth, "admin:quotes:read")) redirect("/quotes");
  } catch {
    redirect("/login");
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
        <h2 style={{ margin: 0 }}>Admin Quotes</h2>
        <LogoutButton />
      </header>
      <QuotesTable admin />
    </div>
  );
}
