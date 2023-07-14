import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardFooter,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@nextui-org/react";
import { IconChevronLeft, IconHash, IconInfoHexagon } from "@tabler/icons-react";
import { Divider } from "@nextui-org/divider";
import { Spacer } from "@nextui-org/spacer";
import { useState } from "react";
import { useToastsStore } from "@/state/toasts";
import { useUserStore } from "@/state/user";
import { Organization } from "@/types/types";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  onOpen: () => void;
}

export default function CreateOrganizationModal({ isOpen, onOpenChange, onOpen }: Props) {
  const user = useUserStore(state => state.user);
  const toastsStore = useToastsStore(state => state);

  const [organization, setOrganization] = useState<Organization>({
    Address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "",
      province: ""
    },
    description: "",
    email: "",
    logoUrl: "",
    name: "",
    phone: ""
  });

  const onSubmit = () => {
    console.log("TODO: Create organization");
    toastsStore.addToast({
      id: "create-organization",
      title: "Create Organization",
      message: "TODO: Not implemented yet",
      type: "warning"
    });
  };

  return (
    <>
      <Modal
        classNames={{
          body: "modal-body overflow-auto",
          backdrop: "modal-backdrop",
          base: "modal-base max-h-full",
          header: "modal-header",
          footer: "modal-footer",
          closeButton: "modal-close-button"
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop={"opaque"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create an Organization</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  startContent={
                    <IconHash className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Name"
                  placeholder={(user?.name || "John Doe") + "'s Awesome Organization"}
                  variant="bordered"
                  value={organization.name}
                  onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  description={"This will be displayed on your invoices and estimates, and cannot be changed later."}
                />
                <Accordion
                  showDivider={true}
                  variant="splitted"
                  className={"px-0 py-2"}
                  itemClasses={{ base: "bg-default-700" }}
                >
                  <AccordionItem key="about" aria-label="about" indicator={<IconChevronLeft />} title="About"
                                 className={"py-2 px-2"}
                                 startContent={<IconInfoHexagon />}
                                 subtitle={"Tell us about your organization. This information will be displayed on your invoices and estimates."}>
                    <div className={"border-none flex flex-col gap-4"}>
                      <Input label="Description" placeholder="This is my awesome organization" variant="bordered"
                             value={organization.description}
                             onChange={(e) => setOrganization({ ...organization, description: e.target.value })} />
                      <Input label="Email" placeholder="contact@cool.org" variant="bordered" value={organization.email}
                             onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
                             description={"This is how other's can contact your organization (optional)"} />
                      <Input label="Phone" placeholder="(123) 456-7890" variant="bordered" value={organization.phone}
                             onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
                             description={"A phone number for your organization (optional)"} />
                    </div>
                  </AccordionItem>
                  <AccordionItem key="address" aria-label="address" indicator={<IconChevronLeft />} title="Address"
                                 subtitle={"Your company's public physical address."}>
                    <div className={"border-none flex flex-col gap-2"}>
                      <Input label="Address Line 1" placeholder="123 Main St" variant="bordered"
                             value={organization.Address.addressLine1}
                             onChange={(e) => setOrganization({
                               ...organization,
                               Address: { ...organization.Address, addressLine1: e.target.value }
                             })} />
                      <Input label="Address Line 2" placeholder="Unit 123" variant="bordered"
                             value={organization.Address.addressLine2}
                             onChange={(e) => setOrganization({
                               ...organization,
                               Address: { ...organization.Address, addressLine2: e.target.value }
                             })} />
                      <Input label="City" placeholder="Toronto" variant="bordered"
                             value={organization.Address.city}
                             onChange={(e) => setOrganization({
                               ...organization,
                               Address: { ...organization.Address, city: e.target.value }
                             })} />
                      <div className={"flex flex-row gap-2"}>
                        <Input label="Province" placeholder="Ontario" variant="bordered"
                               value={organization.Address.province}
                               onChange={(e) => setOrganization({
                                 ...organization,
                                 Address: { ...organization.Address, province: e.target.value }
                               })} />

                        <Input label="Postal Code" placeholder="A1B 2C3" variant="bordered"
                               value={organization.Address.postalCode}
                               onChange={(e) => setOrganization({
                                 ...organization,
                                 Address: { ...organization.Address, postalCode: e.target.value }
                               })} />
                      </div>

                      <Input label="Country" placeholder="Canada" variant="bordered"
                             value={organization.Address.country}
                             onChange={(e) => setOrganization({
                               ...organization,
                               Address: { ...organization.Address, country: e.target.value }
                             })} />
                    </div>

                  </AccordionItem>
                </Accordion>
                <Input label="Logo URL" placeholder="https://cool.org/logo.png" variant="bordered"
                       value={organization.logoUrl}
                       onChange={(e) => setOrganization({ ...organization, logoUrl: e.target.value })}
                       description={"A URL to your organization's logo (optional)"} />
                {organization.logoUrl && (
                  <div className={"flex flex-row gap-2 justify-center"}>
                    <Card className={"w-1/2"}>
                      <Card shadow="sm">
                        <CardBody className="overflow-visible p-0">
                          <Image
                            shadow="sm"
                            radius="lg"
                            width="100%"
                            alt={"Logo"}
                            className={"w-full object-cover h-[140px]"}
                            src={organization.logoUrl}
                          />
                        </CardBody>
                        <CardFooter className="text-small justify-between">
                          <b>{organization.name + "'s logo"}</b>
                          <p className="text-default-500">Preview</p>
                        </CardFooter>
                      </Card>
                    </Card>
                  </div>

                )}
              </ModalBody>
              <Spacer y={1} />
              <Divider />
              <ModalFooter className={"flex flex-row justify-between"}>
                <Button color="danger" variant="light" onClick={onClose}>
                  Close
                </Button>
                <Button variant={"flat"} color={"primary"} onPress={() => {
                  onSubmit();
                  onClose();
                }} className={"hover:bg-primary-50"}>
                  Create Organization
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}