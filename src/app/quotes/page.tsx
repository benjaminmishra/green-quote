import { QuoteForm } from "@/modules/quotes/ui/QuoteForm";
import { QuotesTable } from "@/modules/quotes/ui/QuotesTable";
export default function Page() {
  return (
    <div>
      <h2>My Quotes</h2>
      <QuoteForm />
      <QuotesTable />
    </div>
  );
}
