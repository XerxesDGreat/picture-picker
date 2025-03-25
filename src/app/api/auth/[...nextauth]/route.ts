import NextAuth from "next-auth";
import { authOptions } from "./auth";

const handler = NextAuth(authOptions);

export async function GET(request: Request) {
  const url = new URL(request.url);
  return handler(request, {
    params: { nextauth: url.pathname.split('/').slice(3) }
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  return handler(request, {
    params: { nextauth: url.pathname.split('/').slice(3) }
  });
} 