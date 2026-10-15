export type UploadProgress = {
  percent: number;
  label: string;
};

type Intent =
  | {
      mode: "s3";
      kind: "video";
      path: string;
      uploadUrl: string;
      contentType: string;
      message?: string;
    }
  | {
      mode: "supabase";
      kind: "image";
      path: string;
      contentType: string;
      message?: string;
    };

function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (progress: UploadProgress) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.timeout = 30 * 60 * 1000;
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      const percent = Math.max(8, Math.min(96, Math.round((event.loaded / event.total) * 96)));
      onProgress({
        percent,
        label: `Uploading · ${Math.round(event.loaded / (1024 * 1024))} / ${Math.round(event.total / (1024 * 1024))} MB`,
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      const corsHint =
        xhr.status === 0
          ? " Check that the S3 bucket allows CORS PUT from this site."
          : "";
      reject(new Error(`Upload failed (${xhr.status || "network"}).${corsHint}`));
    };
    xhr.onerror = () => {
      reject(new Error("Upload failed. Check that the S3 bucket allows CORS PUT from this site."));
    };
    xhr.ontimeout = () => reject(new Error("Upload timed out. Try the video again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.send(file);
  });
}

export async function uploadAdminFile(
  file: File,
  kind: "image" | "video",
  onProgress: (progress: UploadProgress) => void,
  _options?: { optimize?: boolean },
) {
  onProgress({ percent: 2, label: "Starting upload" });

  if (kind === "image") {
    onProgress({ percent: 8, label: "Uploading image" });
    const body = new FormData();
    body.append("file", file);
    const uploaded = await fetch("/api/admin/upload-image", { method: "POST", body });
    const payload = (await uploaded.json().catch(() => null)) as { path?: string; message?: string } | null;
    if (!uploaded.ok || !payload?.path) {
      throw new Error(payload?.message || "Upload failed.");
    }
    onProgress({ percent: 100, label: "Upload complete" });
    return payload.path;
  }

  const intentResponse = await fetch("/api/admin/upload-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      contentType: file.type || "application/octet-stream",
    }),
  });
  const intent = (await intentResponse.json()) as Intent & { message?: string };
  if (!intentResponse.ok) {
    throw new Error(intent.message || "Could not start the upload.");
  }

  if (intent.mode === "s3") {
    onProgress({ percent: 6, label: "Uploading to storage" });
    await putWithProgress(intent.uploadUrl, file, intent.contentType, onProgress);
    onProgress({ percent: 100, label: "Upload complete" });
    return intent.path;
  }

  throw new Error("Could not start the upload.");
}
