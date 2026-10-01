import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const folder = "maxylstudios";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing.`);
  return value;
}

function client() {
  return new S3Client({
    region: required("AWS_REGION"),
    credentials: {
      accessKeyId: required("AWS_ACCESS_KEY_ID"),
      secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
    },
  });
}

export function videoObjectKey(extension: string) {
  return `${folder}/${crypto.randomUUID()}.${extension}`;
}

export function videoPublicUrl(key: string) {
  const bucket = required("AWS_S3_BUCKET");
  const region = required("AWS_REGION");
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function s3KeyFromStoredPath(path: string) {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region || !path) return null;
  const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
  if (!path.startsWith(prefix)) return null;
  return decodeURIComponent(path.slice(prefix.length));
}

export async function uploadVideo(key: string, body: Uint8Array, contentType: string) {
  await client().send(
    new PutObjectCommand({
      Bucket: required("AWS_S3_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    }),
  );
  return videoPublicUrl(key);
}

export async function deleteStoredVideo(path: string) {
  const key = s3KeyFromStoredPath(path);
  if (!key) return;
  await client().send(
    new DeleteObjectCommand({
      Bucket: required("AWS_S3_BUCKET"),
      Key: key,
    }),
  );
}
