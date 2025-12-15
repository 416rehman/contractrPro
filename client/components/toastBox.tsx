"use client";

import Toast from "@/components/toast";
import { useToastsStore } from "@/services/toast";

/**
 * The toast box component. It is used to contain all the toasts.
 * - is a container for all the toasts.
 * - displayed on top of all other components.
 * - occupies the bottom right corner of the screen.
 */
export default function ToastBox(props: any) {
  const toastStore = useToastsStore(state => state);

  return <div id={"toasts"} {...props}>
    {toastStore.toasts?.map(toast =>
      <Toast key={toast.id} {...toast} onClose={() => {
        toastStore.removeToast(toast.id);
      }} showDuration={true} durationInSecs={5} />
    )}
  </div>;
}