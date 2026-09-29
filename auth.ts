import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextRequest } from "next/server";

const nextAuth = NextAuth as any;

export const { handlers, auth, signIn, signOut } = nextAuth({
    trustHost: true,
    // เติม: provider ของ Google ที่ import มาด้านบน 
    providers: [Google],

    callbacks: {
        authorized({ auth, request }: { auth: any; request: NextRequest }) {
            const pathname = request.nextUrl.pathname;
            const isProductManagementPage =
                /^\/products\/[^/]+\/(edit|delete)$/.test(pathname);
            if (isProductManagementPage) {
                return Boolean(auth?.user);
            }
            return true;
        },
    },
}); 