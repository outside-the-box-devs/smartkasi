'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { FileInput } from '@astryxdesign/core/FileInput';
import { Thumbnail } from '@astryxdesign/core/Thumbnail';
import { Banner } from '@astryxdesign/core/Banner';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { flyersApi } from '@/lib/api/flyers';
import type { Flyer } from '@/lib/api/flyers';
import { presignUpload, uploadFile } from '@/lib/api/uploads';
import { useFeedback } from '@/hooks/use-feedback';
import { useState } from 'react';

export default function FlyersPanel({ shopId, mode }: { shopId: string; mode: string }) {
  const qc = useQueryClient();
  const feedback = useFeedback();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // `flyersApi.list` already returns the unwrapped array — this used to
  // re-wrap it as `(r as any).data`, which is always undefined on a plain
  // array, so the list silently rendered empty regardless of real data.
  const { data, isLoading, isError } = useQuery<Flyer[]>({
    queryKey: ['flyers', shopId],
    queryFn: () => flyersApi.list(shopId),
  });

  const upload = async () => {
    if (!file || !title) {
      feedback.error('Add a title and choose an image first.', 'flyer');
      return;
    }
    try {
      const presigned = await presignUpload(file, 'flyer', shopId);
      const publicUrl = await uploadFile(file, presigned);
      await flyersApi.create(shopId, {
        title,
        image_url: publicUrl,
        starts_at: new Date().toISOString().slice(0, 10),
        ends_at: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      });
      feedback.success(`"${title}" is live for the next 7 days`, 'flyer');
      setTitle('');
      setFile(null);
      qc.invalidateQueries({ queryKey: ['flyers', shopId] });
    } catch (e) {
      feedback.error(
        e instanceof Error
          ? e.message
          : "Couldn't upload — check your connection and try again.",
        'flyer',
      );
    }
  };

  return (
    <VStack gap={4}>
      <Card>
        <VStack gap={3}>
          <Heading level={3}>Weekly specials</Heading>
          {mode === 'advertising_only' && (
            <Banner
              status="warning"
              title="Flyers reach customers, but they can't order yet"
              description="This shop is in Advertising-only mode — switch to Stock only or Full store to let customers browse or buy."
            />
          )}
          <Text type="body" color="secondary">
            Show customers what&apos;s in stock this week. No till needed — just a photo of your specials.
          </Text>
          <TextInput label="Flyer title" value={title} onChange={setTitle} placeholder="Month-end specials" />
          <FileInput
            label="Flyer image"
            description="A clear photo of your specials board works best"
            accept="image/*"
            maxSize={10 * 1024 * 1024}
            mode="dropzone"
            value={file}
            onChange={(f) => setFile(f as File | null)}
          />
          <Button label="Post flyer" variant="primary" onClick={upload} />
        </VStack>
      </Card>

      <Card>
        <VStack gap={3}>
          <Heading level={4}>Live flyers</Heading>
          {isError && (
            <Banner
              status="error"
              title="Can't load flyers right now"
              description="Check your connection and refresh."
            />
          )}
          {isLoading ? (
            <VStack gap={2}>
              <Skeleton height={72} width={72} />
              <Skeleton height={72} width={72} index={1} />
            </VStack>
          ) : (
            <>
              {(data ?? []).map((f) => (
                <HStack key={f.id} gap={3} style={{ alignItems: 'center' }}>
                  <Thumbnail src={f.image_url} alt={f.title} label={f.title} />
                  <VStack gap={1}>
                    <Text style={{ fontWeight: 600 }}>{f.title}</Text>
                    <Text type="supporting" color="secondary">{f.starts_at} → {f.ends_at}</Text>
                  </VStack>
                </HStack>
              ))}
              {!isError && (!data || data.length === 0) && (
                <Text type="body" color="secondary">No flyers yet — post your first one above.</Text>
              )}
            </>
          )}
        </VStack>
      </Card>
    </VStack>
  );
}
