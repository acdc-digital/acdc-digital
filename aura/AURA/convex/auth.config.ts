const authConfig = {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your JWT template
      // Using CLERK_JWT_ISSUER_DOMAIN from environment variables
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
