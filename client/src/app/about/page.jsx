import Link from "next/link";
import About from "../../Component/About";
import Contactus from "../../Component/ContactUs";

export const metadata = {
  title: "About & Contact | Tastora",
  description: "Learn about Tastora and contact our restaurant team.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white pt-28 sm:pt-32">
      <header className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-xs font-bold uppercase text-rose-700">Tastora</p>
            <h1 className="mt-1 text-2xl font-black text-zinc-900 sm:text-3xl">About &amp; Contact</h1>
          </div>
          <Link href="/menu" className="text-sm font-bold text-rose-700 hover:text-rose-800">
            Explore the menu
          </Link>
        </div>
      </header>
      <About />
      <Contactus />
    </main>
  );
}