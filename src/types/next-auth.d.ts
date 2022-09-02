/* eslint-disable @typescript-eslint/no-unused-vars */
import "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User
  }

  interface User {
    id: string
    name: string
    movement: "SUF" | "AGSE" | "SGDF"
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    user: User
  }
}
