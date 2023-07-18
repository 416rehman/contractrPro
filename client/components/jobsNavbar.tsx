"use client";

import { Input } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { IconChevronDown } from "@tabler/icons-react";
import { Job } from "@/types";

interface JobProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

/**
 * This is the main form for editing and or creating a job. The form receives the job id as a prop.
 * If the job id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Job service.
 * TODO: Implement this component and the Job service.
 */
export default function JobsNavbar({ jobs, onSelectJob }: JobProps) {
  return (
    <div className="jobs-navbar flex flex-col items-center justify-between gap-4 px-2">
      <div className={"w-full flex flex-col gap-2"}>
        <Input placeholder="Search" width="80%" />
        <Divider />
        {jobs.map((job) => (
          <ButtonGroup variant="flat" key={job.id} className="w-full">
            <Button className={"w-full"} size={"sm"} onPress={() => onSelectJob(job)}>
              {job.name}
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size={"sm"}>
                  <IconChevronDown />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Job options"
                selectionMode="single"
                className="max-w-[300px]"
              >
                <DropdownItem key="delete" description={"Delete the job"}>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </ButtonGroup>
        ))
        }
      </div>
      <div className={"w-full flex flex-col gap-2"}>
        <Divider />
        <Button variant="ghost" auto className={"w-full"}>
          Add Job
        </Button>
      </div>
    </div>
  );
}