"use client";

import { authClient } from "@/lib/auth/client";
import { useState } from "react";

export default function SignUpPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function handleSignUp(e: React.FormEvent) {
		e.preventDefault();
		await authClient.signUp.email(
			{ name, email, password },
			{
				onSuccess: () => {
					window.location.href = "/dashboard";
				},
				onError: (ctx) => {
					setError(ctx.error.message);
				},
			},
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<form onSubmit={handleSignUp} className="w-full max-w-sm space-y-4">
				<h1 className="text-2xl font-bold">Sign Up</h1>
				{error && <p className="text-sm text-red-500">{error}</p>}
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded border px-3 py-2"
					required
				/>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full rounded border px-3 py-2"
					required
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full rounded border px-3 py-2"
					required
				/>
				<button
					type="submit"
					className="w-full rounded bg-foreground py-2 font-medium text-background"
				>
					Sign Up
				</button>
				<p className="text-center text-sm">
					Already have an account?{" "}
					<a href="/sign-in" className="underline">
						Sign in
					</a>
				</p>
			</form>
		</div>
	);
}
