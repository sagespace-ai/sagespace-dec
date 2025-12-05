import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

let s3Client: S3Client | null = null

// Only initialize if R2 credentials are available
if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  })
}

const BUCKET = process.env.R2_BUCKET || "sagespace-artifacts"

export async function getUploadSignedUrl(key: string, contentType: string): Promise<string> {
  if (!s3Client) {
    throw new Error("R2 storage not configured")
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export async function getDownloadSignedUrl(key: string): Promise<string> {
  if (!s3Client) {
    throw new Error("R2 storage not configured")
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export function generateArtifactKey(userId: string, filename: string): string {
  const timestamp = Date.now()
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `artifacts/${userId}/${timestamp}-${sanitized}`
}
