import { title } from "@/components/primitives";

export const metadata = {
  title: "Expenses | ContractrPro"
};
export default function ExpensePage() {
  return (
    <div>
      <h1 className={title()}>Expenses</h1>
    </div>
  );
}