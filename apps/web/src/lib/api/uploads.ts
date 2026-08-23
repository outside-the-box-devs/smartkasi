import { apiFetch, unwrap } from './client';

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
}

/** Purposes the API presigns for (must match apps/api UploadPurpose). */
export type UploadPurpose =
  | 'shop_logo'
  | 'product_image'
  | 'flyer'
  | 'licence_doc'
  | 'delivery_proof'
  | 'avatar';

/** Content types the presign endpoint accepts. */
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

/**
 * The API only signs PUTs for a fixed set of content types. Phone photos that
 * report HEIC/HEIF or an empty type are sent as JPEG — R2 stores whatever bytes
 * arrive; this just keeps the signed content-type inside the allowed enum.
 */
function normalizeContentType(file: File): string {
  const type = (file.type || '').toLowerCase();
  if ((ALLOWED_CONTENT_TYPES as readonly string[]).includes(type)) return type;
  if (type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name)) {
    return 'image/jpeg';
  }
  throw new Error(
    'That file type is not supported — use JPG, PNG, WebP or PDF.',
  );
}

/** Presign response — API speaks snake_case, legacy clients camelCase. */
interface PresignResponse {
  upload_url?: string;
  uploadUrl?: string;
  url?: string;
  public_url?: string;
  publicUrl?: string;
}

/**
 * Get a short-lived upload URL from the API. Images never touch the API —
 * the caller PUTs straight to object storage with uploadFile().
 */
export async function presignUpload(
  file: File,
  purpose: UploadPurpose,
  shopId?: string,
): Promise<PresignedUpload> {
  const body: Record<string, unknown> = {
    purpose,
    content_type: normalizeContentType(file),
  };
  if (shopId) body.shop_id = shopId;

  const raw = await unwrap<PresignResponse>(
    await apiFetch('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );
  const uploadUrl = raw.upload_url ?? raw.uploadUrl ?? raw.url;
  const publicUrl = raw.public_url ?? raw.publicUrl;
  if (!uploadUrl || !publicUrl) {
    throw new Error('Upload service returned an unexpected response.');
  }
  return { uploadUrl, publicUrl };
}

/** Upload a file straight to object storage using the presigned URL. */
export async function uploadFile(
  file: File,
  presigned: PresignedUpload,
): Promise<string> {
  await fetch(presigned.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': normalizeContentType(file) },
  });
  return presigned.publicUrl;
}
