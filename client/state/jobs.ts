import { create } from "zustand";

export const useJobsStore = create((set: any) => ({
  jobs: [{
    id: "1",
    name: "Job 1"
  },
    {
      id: "2",
      name: "Job 2"
    },
    {
      id: "3",
      name: "Job 3"
    }] as Job[],
  setJobs: (jobs: any) => set({ jobs }),
  addJob: (job: any) => set((state: any) => ({ jobs: [...state.jobs, job] })),
  removeJob: (jobId: string) => set((state: any) => ({ jobs: state.jobs.filter((job: any) => job.id !== jobId) })),

  updateJob(jobId: string, job: any) {
    set((state: any) => ({
      jobs: state.jobs.map((j: any) => {
        if (j.id === jobId) {
          return job;
        }
        return j;
      })
    }));
  }
}));