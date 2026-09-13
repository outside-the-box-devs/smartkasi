'use client';

import { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { FileInput } from '@astryxdesign/core/FileInput';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { Banner } from '@astryxdesign/core/Banner';
import { shopsApi, friendlyLicence, licenceDotVariant } from '@/lib/api/shops';
import type { ShopDetail } from '@/lib/api/shops';
import { presignUpload, uploadFile } from '@/lib/api/uploads';
import { useFeedback } from '@/hooks/use-feedback';

export default function LicensePanel({ shop }: { shop: ShopDetail }) {
  const feedback = useFeedback();
  const [licenceNo, setLicenceNo] = useState(shop.trading_licence_no ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSubmit = async () => {
    if (!file) {
      feedback.error('Choose a photo or PDF of your licence first.', 'licence');
      return;
    }
    setUploading(true);
    try {
      const presigned = await presignUpload(file, 'licence_doc', shop.id);
      const publicUrl = await uploadFile(file, presigned);
      await shopsApi.submitLicence(shop.id, publicUrl, licenceNo);
      feedback.success('Licence submitted — we review within one business day', 'licence');
    } catch (e) {
      feedback.error(
        e instanceof Error
          ? e.message
          : 'Upload failed — check your connection and try again.',
        'licence',
      );
    }
    setUploading(false);
  };

  return (
    <VStack gap={4}>
      <Card>
        <VStack gap={4}>
          <HStack gap={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={3}>Trading licence</Heading>
            <HStack gap={2} style={{ alignItems: 'center' }}>
              <StatusDot
                variant={licenceDotVariant(shop.licence_status)}
                label={friendlyLicence(shop.licence_status)}
              />
              <Text type="supporting">{friendlyLicence(shop.licence_status)}</Text>
            </HStack>
          </HStack>

          {shop.licence_status === 'verified' && (
            <Banner status="success" title="Your licence is verified" description="This shop can accept customer orders." />
          )}
          {shop.licence_status === 'pending' && (
            <Banner status="warning" title="Under review" description="We're checking your documents. You'll be able to take orders once it's approved." />
          )}
          {shop.licence_status === 'rejected' && (
            <Banner status="error" title="Your licence was rejected" description="Check the licence number and document, then submit again." />
          )}
          {shop.licence_status === 'expired' && (
            <Banner status="warning" title="Your licence has expired" description="Submit a current licence to keep taking orders." />
          )}
          {(shop.licence_status === 'none' || !shop.licence_status) && (
            <Banner status="info" title="Upload your licence to start taking orders" description="A valid trading licence is required before customers can order from this shop." />
          )}

          <TextInput label="Licence number" value={licenceNo} onChange={setLicenceNo} placeholder="e.g. GP/SOW/2026/00841" />

          <FileInput
            label="Licence document"
            description="Photo or PDF, up to 10 MB"
            accept="image/*,application/pdf"
            maxSize={10 * 1024 * 1024}
            mode="dropzone"
            value={file}
            onChange={(f) => setFile(f as File | null)}
          />

          <Button
            label="Submit for review"
            variant="primary"
            isLoading={uploading}
            isDisabled={shop.licence_status === 'verified'}
            onClick={onSubmit}
          />
        </VStack>
      </Card>
    </VStack>
  );
}
