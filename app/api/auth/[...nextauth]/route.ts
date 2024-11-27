import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// Extend the NextAuthUser interface to ensure `id` is treated as a string
interface NextAuthUserWithStringId extends NextAuthUser {
  id: string;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      issuer: "https://accounts.google.com",
      profile(profile) {
        // Convert `id` to string to avoid type mismatches
        return {
          id: profile.id.toString(),
          name: profile.name || profile.given_name || profile.family_name,
          email: profile.email,
          image: profile.picture,
        } as NextAuthUserWithStringId;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id.toString(); // Ensure `id` is always a string
      }
      return session;
    },
    async redirect() {
      return "/todo";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
