"use client";

import JobsNavbar from "@/components/jobsNavbar";
import { useJobsStore } from "@/state/jobs";
import { useState } from "react";
import JobForm from "@/components/jobForm";

export default function JobScreen() {
  const jobStore = useJobsStore((state) => state);
  const [selectedJobIdx, setSelectedJobIdx] = useState<number>(0);

  return (
    <div className={"flex flex-row gap-4 py-8 md:py-10"}>
      <JobsNavbar jobs={jobStore.jobs} onSelectJob={(job) => {
        setSelectedJobIdx(jobStore.jobs.indexOf(job));
      }} />
      <JobForm job={jobStore.jobs[selectedJobIdx]} updateJob={(job) => {
        jobStore.updateJob(job.id, job);
      }} />
    </div>
  );
}