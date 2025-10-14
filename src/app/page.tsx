import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start gap-8 p-6 font-sans sm:p-10">
      <Navbar />
      <main className="flex w-full max-w-7xl flex-1 flex-col items-center justify-center">
        {/* page content here */}
      </main>
    </div>
  );
}
