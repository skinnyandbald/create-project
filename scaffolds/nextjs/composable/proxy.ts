import { auth } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (request.nextUrl.pathname.startsWith("/dashboard") && !session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	return NextResponse.next({ request });
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
