"use client";

import { Button } from "@nextui-org/button";

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
    <Button onPress={() => reset()}>Try again</Button>
    </body>
    </html>
  );
}