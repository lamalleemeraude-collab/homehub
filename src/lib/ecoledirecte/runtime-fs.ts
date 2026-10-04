import path from "path";

/** Vercel / Lambda : FS de l’app en lecture seule ; `/tmp` OK mais éphémère. */
export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL_ENV
  );
}

export function edStoreDir(): string {
  if (isServerlessRuntime()) {
    return path.join("/tmp", "homehub-ed");
  }
  return path.join(process.cwd(), "data");
}

export function isReadonlyFsError(error: unknown): boolean {
  const err = error as NodeJS.ErrnoException;
  return (
    err?.code === "EROFS" ||
    err?.code === "EACCES" ||
    err?.code === "EPERM" ||
    /read-only file system/i.test(err?.message || "")
  );
}
