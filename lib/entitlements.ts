import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getIsPremiumForCurrentUser(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return Boolean((user.publicMetadata?.is_premium as boolean | undefined) ?? false);
}

export async function markUserPremium(opts: { userId?: string; email?: string }): Promise<boolean> {
  const client = await clerkClient();
  let targetUserId = opts.userId;

  if (!targetUserId && opts.email) {
    const list = await client.users.getUserList({ emailAddress: [opts.email] });
    targetUserId = list.data[0]?.id;
  }
  if (!targetUserId) return false;

  const user = await client.users.getUser(targetUserId);
  await client.users.updateUser(targetUserId, {
    publicMetadata: {
      ...user.publicMetadata,
      is_premium: true,
    },
  });
  return true;
}
