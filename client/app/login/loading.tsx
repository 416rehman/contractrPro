import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Loading() {
  return <div className={"flex justify-center items-center h-full w-full"}>
    <LoadingSpinner />
  </div>;
}