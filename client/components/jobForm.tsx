import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { Job } from "@/types";

interface IJobFormProps {
  job: Job;
  updateJob: (job: Job) => void;
}

/**
 * This is the main form for editing and or creating a job. The form receives the job id as a prop.
 * If the job id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Job service.
 * TODO: Implement this component and the Job service.
 */
export default function JobForm({ job, updateJob }: IJobFormProps) {
  const handleChange = (e) => {
    updateJob({ ...job, name: e.target.value });
  };
  return (
    <form>
      <h1>Job# {job.id}</h1>
      <Input aria-label="Job Name"
             placeholder="Job Name" width="80%" value={job.name} onChange={handleChange} />
      <Button auto>Save</Button>
    </form>
  );
}