import { RegisterForm } from "@/modules/auth/ui/RegisterForm";
import { authPageStyle } from "@/modules/auth/ui/authFormStyles";

export default function Page() {
  return (
    <main style={authPageStyle}>
      <RegisterForm />
    </main>
  );
}
