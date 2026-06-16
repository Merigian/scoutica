/**
 * POST a file to an endpoint with upload progress reporting.
 *
 * fetch() has no upload-progress events, so portfolio/profile photo uploads use
 * XHR to drive a real progress bar. Resolves with the parsed JSON response.
 */
export interface UploadResult {
  success: boolean;
  error?: string;
}

export function uploadFileWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
  fieldName = "file",
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as UploadResult;
        resolve(data);
      } catch {
        resolve({ success: false, error: xhr.statusText || "Upload failed" });
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}
