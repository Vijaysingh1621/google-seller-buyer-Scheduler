import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email", 
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.readonly"
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      try {
        await connectToDatabase();
        
        // Check if user exists
        let existingUser = await User.findOne({ 
          $or: [
            { email: user.email },
            { googleId: account.providerAccountId }
          ]
        });

        if (!existingUser) {
          // For new users, we'll set role later via API call
          // Default to buyer for now
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
            role: 'buyer', // Default role, will be updated based on selection
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiry: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
            calendarConnected: true,
          });
        } else {
          // Update existing user with new tokens
          existingUser.accessToken = account.access_token;
          existingUser.refreshToken = account.refresh_token;
          existingUser.tokenExpiry = account.expires_at ? new Date(account.expires_at * 1000) : undefined;
          existingUser.calendarConnected = true;
          await existingUser.save();
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: user.email });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.userId = dbUser._id.toString();
          token.calendarConnected = dbUser.calendarConnected;
        }
      } else {
        // Refresh user data from database on every request to get updated role
        await connectToDatabase();
        const dbUser = await User.findById(token.userId);
        if (dbUser) {
          token.role = dbUser.role;
          token.calendarConnected = dbUser.calendarConnected;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.userId as string;
        session.user.calendarConnected = token.calendarConnected as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});