import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			<p className="mt-2">Welcome, {session?.user.email}</p>
		</div>
	);
}
