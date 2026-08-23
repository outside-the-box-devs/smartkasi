'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { Center, VStack, Spinner, Text } from '@astryxdesign/core';

/**
 * Blocks rendering until the session is restored AND the user is signed in.
 * Unauthenticated visitors are redirected to /auth/login with a return path.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <AuthSplash label="Checking your session…" />;
  if (!isAuthenticated) return <AuthSplash label="Redirecting to sign in…" />;

  return <>{children}</>;
}

function AuthSplash({ label }: { label: string }) {
  return (
    <Center axis="both" padding={6} style={{ minHeight: '100dvh', backgroundColor: 'var(--color-background-body)' }}>
      <VStack gap={3} hAlign="center">
        <Spinner size="md" />
        <Text type="body" color="secondary">{label}</Text>
      </VStack>
    </Center>
  );
}
