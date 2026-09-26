import { PageContainer } from "../../../components/layout/PageContainer";
import { AuthForm } from "./AuthForm";

export function LoginScreen() {
  return (
    <PageContainer>
      <section>
        <p>Watchnotes</p>
        <h1>Welcome back.</h1>
        <AuthForm mode="login" />
      </section>
    </PageContainer>
  );
}
