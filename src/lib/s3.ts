import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

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

export async function uploadVideo(key: string, body: Uint8Array | ReadableStream | Readable, contentType: string) {
  const stream =
    body instanceof Uint8Array ? Readable.from(body) : body instanceof Readable ? body : Readable.fromWeb(body as WebReadableStream);
  const upload = new Upload({
    client: client(),
    queueSize: 4,
    partSize: 8 * 1024 * 1024,
    leavePartsOnError: false,
    params: {
      Bucket: required("AWS_S3_BUCKET"),
      Key: key,
      Body: stream,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    },
  });
  await upload.done();
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
