"use client";

import { Input } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { IconChevronDown } from "@tabler/icons-react";

interface JobProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
}

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
                aria-label="Merge options"
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