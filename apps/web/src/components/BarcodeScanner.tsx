'use client';

import { useEffect, useRef, useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Text as XText } from '@astryxdesign/core/Text';

export default function BarcodeScanner({ onScan }: { onScan?: (barcode: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scanning, setScanning] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanning || !ref.current) return;
    let scanner: any;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        scanner = new Html5Qrcode(ref.current!.id);
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded: string) => {
            if (cancelled) return;
            setLast(decoded);
            setScanning(false);
            onScan?.(decoded);
            try { scanner.stop(); } catch {}
          },
          () => {},
        );
      } catch (e: any) {
        setError('Camera not available — type the barcode instead.');
      }
    })();
    return () => {
      cancelled = true;
      try { scanner?.stop?.(); } catch {}
    };
  }, [scanning]);

  return (
    <VStack gap={3}>
      <HStack gap={2} style={{ justifyContent: 'space-between', alignItems: 'center' } as any}>
        <Heading level={4}>Scan a barcode</Heading>
        <Badge variant={scanning ? 'success' : 'neutral'} label={scanning ? 'Camera on' : 'Ready'} />
      </HStack>
      <div
        id="smartkasi-scanner"
        ref={ref}
        style={{
          width: '100%',
          minHeight: scanning ? 240 : 0,
          borderRadius: 'var(--radius-container)',
          overflow: 'hidden',
          background: 'var(--color-background-muted)',
        } as any}
      />
      <HStack gap={2} style={{ alignItems: 'center' } as any}>
        <Button label={scanning ? 'Stop camera' : 'Start camera'} variant={scanning ? 'secondary' : 'primary'} onClick={() => setScanning(!scanning)} />
        {last && <Badge variant="teal" label={`Last scan: ${last}`} />}
      </HStack>
      {error && <XText type="body" color="secondary">{error}</XText>}
    </VStack>
  );
}
