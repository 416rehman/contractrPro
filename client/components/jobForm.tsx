import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";

interface IJobFormProps {
  job: Job;
  updateJob: (job: Job) => void;
}

export default function JobForm({ job, updateJob }: IJobFormProps) {
  const handleChange = (e) => {
    updateJob({ ...job, name: e.target.value });
  };
  return (
    <form>
      <h1>Job# {job.id}</h1>
      <Input placeholder="Job Name" width="80%" value={job.name} onChange={handleChange} />
      <Button auto>Save</Button>
    </form>
  );
}