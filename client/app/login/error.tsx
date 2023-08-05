"use client";

export default function Error() {
  return (
    <div className={"flex flex-col items-center justify-center w-full max-w-md mx-auto"}>
      <h1 className={"text-4xl font-bold"}>Uh oh!</h1>
      <p className={"text-xl"}>Something went wrong.</p>
    </div>
  );
}