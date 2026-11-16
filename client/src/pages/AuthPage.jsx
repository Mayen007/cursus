export default function AuthPage({ children, promotion }) {
  return (
    <main className="min-h-screen bg-paper text-ink md:grid md:min-h-dvh md:grid-cols-[42%_58%]">
      <section className="flex min-h-dvh items-center justify-center px-5 py-12 sm:px-10 md:px-8 lg:px-12">
        {children}
      </section>
      <aside className="hidden min-h-dvh items-center justify-center bg-ink px-8 text-paper md:flex">
        <div className="w-full max-w-[520px] text-center">{promotion}</div>
      </aside>
    </main>
  );
}
