const authConfig = {
  providers: [
    {
      // Using your Clerk JWT template issuer domain
      domain: "https://shining-seahorse-35.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
