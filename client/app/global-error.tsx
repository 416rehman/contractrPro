"use client";

export default function GlobalError({
                                      error,
                                      reset
                                    }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
    <body>
    <h2>Uh Oh! Something went wrong!</h2>
    <p className={"text-myred-500"}>
      <strong>{error.message}</strong>
    </p>
    <button onClick={() => reset()}>Try again</button>
    </body>
    </html>
  );
}