import UserForm from "@/components/userForm";

export const metadata = {
  title: "Account | ContractrPro"
};
export default function UserPage() {
  return (
    <div className="flex flex-col flex-grow w-full items-center justify-center">
      <UserForm />
    </div>
  );
}