import { title } from "@/components/primitives";

export default function AboutPage() {
  return (<>
      <section className="flex flex-col flex-grow gap-4 py-8 h-full" id={"contracts"}>
        <h1 className={title()}>Contracts</h1>
      </section>
    </>
  );
}