import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    id?: string;
    isPremium?: boolean;
  }
  interface Session {
    user?: User & {
      id?: string;
      isPremium?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPremium?: boolean;
  }
}

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // ✅ สร้าง/อัปเดต user ในฐานข้อมูลเมื่อ sign in
      try {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || undefined,
              image: user.image || undefined,
            },
          });
        }
      } catch (error) {
        console.error("signIn callback error:", error);
      }
      return true;
    },
    async jwt({ token, user }) {
      try {
        // If this callback is invoked during sign-in, `user` will be present.
        // Otherwise, attempt to keep `token.isPremium` in sync with DB by
        // reloading the user record when possible.
        if (user) {
          // On sign-in prefer the newly created/returned user
          token.id = (user as any).id;
        }

        // Try to resolve user by id (if available) or email stored on token
        const where = token.id
          ? { id: token.id }
          : token.email
          ? { email: token.email }
          : null;

        if (where) {
          const dbUser = await prisma.user.findUnique({
            where: where as any,
            select: { isPremium: true, id: true, email: true },
          });
          if (dbUser) {
            token.isPremium = dbUser.isPremium ?? false;
            token.id = dbUser.id ?? token.id;
            token.email = dbUser.email ?? token.email;
          }
        }
      } catch (e) {
        console.error("jwt callback error:", e);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isPremium = token.isPremium ?? false;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
