import AuthForm from "../components/AuthForm.jsx";
import AuthPromotion from "../components/AuthPromotion.jsx";

export default function AuthPage({ mode }) {
  return (
    <main className="min-h-screen bg-paper text-ink md:grid md:min-h-dvh md:grid-cols-[42%_58%]">
      <section className="flex min-h-dvh items-center justify-center px-5 py-12 sm:px-10 md:px-8 lg:px-12">
        <AuthForm key={mode} mode={mode} />
      </section>
      <AuthPromotion />
    </main>
  );
}
