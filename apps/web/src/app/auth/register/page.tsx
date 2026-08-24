'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Center } from '@astryxdesign/core/Center';
import { Text, Heading } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Selector } from '@astryxdesign/core/Selector';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Icon } from '@astryxdesign/core/Icon';
import { Banner } from '@astryxdesign/core/Banner';
import { useAuth } from '@/lib/auth/auth-context';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('shop_owner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Fill in your name, email and a password.');
      return;
    }
    if (password.length < 6) {
      setError('Choose a password with at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim(), role);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(friendlyRegisterError(e));
    }
    setIsLoading(false);
  };

  return (
    <Center axis="both" padding={6} style={{ minHeight: '100dvh', backgroundColor: 'var(--color-background-body)' }}>
      <VStack gap={4} hAlign="center" style={{ width: '100%', maxWidth: 440 }}>
        <VStack gap={2} hAlign="center">
          <Icon icon={BuildingStorefrontIcon} size="lg" />
          <Text type="body" weight="bold" size="lg">SmartKasi</Text>
        </VStack>

        <Card padding={6} width="100%">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
          >
            <VStack gap={4} hAlign="stretch">
              <VStack gap={1} hAlign="center">
                <Heading level={2}>Create your account</Heading>
                <Text type="body" color="secondary" size="sm">Shop owners can add their licence after signing up</Text>
              </VStack>

              {error && <Banner status="error" title={error} container="card" />}

              <TextInput label="Full name" value={fullName} onChange={setFullName} placeholder="Thoko Ndlovu" size="lg" htmlName="full-name" />
              <TextInput label="Email" value={email} onChange={setEmail} placeholder="you@shop.co.za" type="email" size="lg" htmlName="email" />
              <TextInput label="Password" value={password} onChange={setPassword} placeholder="At least 6 characters" type="password" size="lg" htmlName="password" />

              <Selector
                label="I am a…"
                value={role}
                onChange={(v) => setRole(v)}
                options={[
                  { label: 'Shop owner', value: 'shop_owner' },
                  { label: 'Customer', value: 'customer' },
                  { label: 'Courier', value: 'courier' },
                ]}
              />

              <Button label="Create account" variant="primary" size="lg" isLoading={isLoading} type="submit" />

              <HStack gap={3} hAlign="center">
                <Text type="body" color="secondary" size="sm">Already registered?</Text>
                <Button label="Sign in" variant="ghost" onClick={() => router.push('/auth/login')} />
              </HStack>
            </VStack>
          </form>
        </Card>
      </VStack>
    </Center>
  );
}

function friendlyRegisterError(e: any): string {
  switch (e?.uiCode ?? e?.code) {
    case 'EMAIL_TAKEN': return 'That email already has an account — sign in instead.';
    case 'WEAK_PASSWORD': return 'Choose a password with at least 6 characters.';
    case 'NETWORK': return "Can't reach the sign-in service. Check your connection.";
    default: return 'Could not create the account. Please try again.';
  }
}
