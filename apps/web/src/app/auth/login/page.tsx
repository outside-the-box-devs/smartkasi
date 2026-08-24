'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Center } from '@astryxdesign/core/Center';
import { Text, Heading } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '@/lib/auth/auth-context';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(friendlyAuthError(e));
    }
    setIsLoading(false);
  };

  return (
    <Center axis="both" padding={6} style={{ minHeight: '100dvh', backgroundColor: 'var(--color-background-body)' }}>
      <VStack gap={4} hAlign="center" style={{ width: '100%', maxWidth: 400 }}>
        <VStack gap={2} hAlign="center">
          <Icon icon={BuildingStorefrontIcon} size="lg" />
          <Text type="body" weight="bold" size="lg">SmartKasi</Text>
        </VStack>

        <Card padding={6} width="100%">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            <VStack gap={4} hAlign="stretch">
              <VStack gap={1} hAlign="center">
                <Heading level={2}>Sign in</Heading>
                <Text type="body" color="secondary" size="sm">Manage your shop from anywhere</Text>
              </VStack>

              {error && <Banner status="error" title={error} container="card" />}

              <TextInput label="Email" value={email} onChange={setEmail} placeholder="you@shop.co.za" type="email" size="lg" htmlName="email" />
              <TextInput
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Your password"
                type="password"
                size="lg"
                htmlName="password"
              />

              <Button label="Sign in" variant="primary" size="lg" isLoading={isLoading} type="submit" />
            </VStack>
          </form>

          <HStack gap={3} hAlign="center">
            <Text type="body" color="secondary" size="sm">New here?</Text>
            <Button label="Create an account" variant="ghost" onClick={() => router.push('/auth/register')} />
          </HStack>
        </Card>
      </VStack>
    </Center>
  );
}

export function friendlyAuthError(e: any): string {
  switch (e?.uiCode ?? e?.code) {
    case 'WRONG_PASSWORD':
    case 'BAD_CREDENTIALS': return 'Wrong email or password. Try again.';
    case 'EMAIL_TAKEN': return 'That email already has an account — sign in instead.';
    case 'WEAK_PASSWORD': return 'Choose a password with at least 6 characters.';
    case 'NETWORK': return "Can't reach the sign-in service. Check your connection.";
    default: return 'Something went wrong. Please try again.';
  }
}
