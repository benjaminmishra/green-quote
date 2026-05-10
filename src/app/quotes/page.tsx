import { LogoutButton } from "@/modules/auth/ui/LogoutButton";
import { QuoteForm } from "@/modules/quotes/ui/QuoteForm";
import { QuotesTable } from "@/modules/quotes/ui/QuotesTable";

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
        <h2 style={{ margin: 0 }}>My Quotes</h2>
        <LogoutButton />
      </header>
      <QuoteForm />
      <QuotesTable />
    </div>
  );
}
