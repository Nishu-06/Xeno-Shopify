import { getServerSession } from 'next-auth/next';

export async function getSession() {
  return await getServerSession();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

