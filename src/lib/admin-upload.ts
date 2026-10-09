export type UploadProgress = {
  percent: number;
  label: string;
};

export function uploadAdminFile(
  file: File,
  kind: "image" | "video",
  onProgress: (progress: UploadProgress) => void,
  options?: { optimize?: boolean },
) {
  return new Promise<string>((resolve, reject) => {
    const form = new FormData();
    form.set("file", file);
    form.set("kind", kind);
    if (options?.optimize) form.set("optimize", "web");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.responseType = "json";
    xhr.timeout = 30 * 60 * 1000;

    let shown = 2;
    let saving: number | undefined;

    function stopSaving() {
      if (saving === undefined) return;
      window.clearInterval(saving);
      saving = undefined;
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      shown = Math.max(shown, Math.min(90, Math.round((event.loaded / event.total) * 90)));
      onProgress({
        percent: shown,
        label: `Uploading · ${Math.round(event.loaded / (1024 * 1024))} / ${Math.round(event.total / (1024 * 1024))} MB`,
      });
    };

    xhr.upload.onload = () => {
      shown = Math.max(shown, 92);
      const finishing = kind === "video" ? "Saving the video" : "Saving";
      onProgress({ percent: shown, label: finishing });
      saving = window.setInterval(() => {
        shown = Math.min(98, shown + 1);
        onProgress({ percent: shown, label: finishing });
        if (shown >= 98) stopSaving();
      }, 800);
    };

    xhr.onload = () => {
      stopSaving();
      const body = xhr.response as { path?: string; message?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.path) {
        onProgress({ percent: 100, label: "Upload complete" });
        resolve(body.path);
        return;
      }
      reject(new Error(body?.message || "Upload failed."));
    };

    xhr.onerror = () => {
      stopSaving();
      reject(new Error("Upload failed."));
    };
    xhr.ontimeout = () => {
      stopSaving();
      reject(new Error("Upload timed out. Try the video again."));
    };
    xhr.onabort = () => {
      stopSaving();
      reject(new Error("Upload cancelled."));
    };

    onProgress({ percent: 2, label: "Starting upload" });
    xhr.send(form);
  });
}
