import OrgSettingsForm from "@/components/orgSettingsForm";

export const metadata = {
  title: "Organization Settings | ContractrPro"
};
export default function UserPage() {
  return (
    <div className="flex flex-col flex-grow w-full items-center justify-center">
      <OrgSettingsForm />
    </div>
  );
}