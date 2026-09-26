import { PageContainer } from "../../../components/layout/PageContainer";
import { AuthForm } from "./AuthForm";

export function SignUpScreen() {
  return (
    <PageContainer>
      <section>
        <p>Watchnotes</p>
        <h1>Create your profile.</h1>
        <p>Your rankings, watch history, notes, and taste profile will live here.</p>
        <AuthForm mode="signup" />
      </section>
    </PageContainer>
  );
}
