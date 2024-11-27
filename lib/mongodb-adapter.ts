import { MongoClient } from "mongodb";
import type { Adapter } from "next-auth/adapters";
import clientPromise from "./mongodb";

export default function MongoDBAdapter(): Adapter {
  return {
    async createUser(user) {
      const client = await clientPromise;
      const result = await client
        .db()
        .collection("users")
        .insertOne({ ...user, emailVerified: null });
      
      const newUser = await client
        .db()
        .collection("users")
        .findOne({ _id: result.insertedId });
      
      return { ...newUser, id: newUser!._id.toString() };
    },

    async getUser(id) {
      const client = await clientPromise;
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: id });
      
      if (!user) return null;
      return { ...user, id: user._id.toString() };
    },

    async getUserByEmail(email) {
      const client = await clientPromise;
      const user = await client
        .db()
        .collection("users")
        .findOne({ email });
      
      if (!user) return null;
      return { ...user, id: user._id.toString() };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const client = await clientPromise;
      const account = await client
        .db()
        .collection("accounts")
        .findOne({ provider, providerAccountId });
      
      if (!account) return null;
      
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: account.userId });
      
      if (!user) return null;
      return { ...user, id: user._id.toString() };
    },

    async linkAccount(account) {
      const client = await clientPromise;
      await client
        .db()
        .collection("accounts")
        .insertOne(account);
      return account;
    },

    async createSession(session) {
      const client = await clientPromise;
      await client
        .db()
        .collection("sessions")
        .insertOne(session);
      return session;
    },

    async getSessionAndUser(sessionToken) {
      const client = await clientPromise;
      const session = await client
        .db()
        .collection("sessions")
        .findOne({ sessionToken });
      
      if (!session) return null;
      
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: session.userId });
      
      if (!user) return null;
      
      return {
        session,
        user: { ...user, id: user._id.toString() },
      };
    },

    async updateSession(session) {
      const client = await clientPromise;
      await client
        .db()
        .collection("sessions")
        .updateOne(
          { sessionToken: session.sessionToken },
          { $set: session }
        );
      return session;
    },

    async deleteSession(sessionToken) {
      const client = await clientPromise;
      await client
        .db()
        .collection("sessions")
        .deleteOne({ sessionToken });
    },
  };
}
