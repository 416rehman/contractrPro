"use client";

import Toast from "@/components/toast";
import { useToastsStore } from "@/services/toast";
import { Button } from "@nextui-org/button";

export default function ToastBox(props: any) {
  const toastStore = useToastsStore(state => state);

  return <div id={"toasts"} {...props}>
    <Button onPress={() => {
      toastStore.addToast({ id: "demo-toast", title: "DEMO", message: "This is a demo toast" });
    }}>
      Add Demo Toast
    </Button>

    {toastStore.toasts.map(toast =>
      <Toast key={toast.id} {...toast} onClose={() => {
        toastStore.removeToast(toast.id);
      }} showDuration={true} durationInSecs={5} />
    )}
  </div>;
}