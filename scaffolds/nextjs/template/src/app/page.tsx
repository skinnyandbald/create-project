import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">{"{{PROJECT_NAME}}"}</h1>
      <p className="text-lg text-gray-500">
        Built with Next.js 16, Supabase, and tRPC
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Dashboard
        </Link>
        <Link href="/sign-in" className="rounded border px-4 py-2">
          Sign In
        </Link>
      </div>
    </div>
  );
}
