import { Accordion, AccordionItem, Button, Card, CardBody, CardFooter, Image, Input } from "@nextui-org/react";
import { IconChevronLeft, IconHash } from "@tabler/icons-react";
import { updateOrganizationAndPersist, useUserStore } from "@/services/user";
import { useToastsStore } from "@/services/toast";
import { useEffect, useState } from "react";
import { Organization } from "@/types";
import moment from "moment/moment";

const emptyOrg = {
  id: "",
  name: "",
  description: "",
  email: "",
  website: "",
  phone: "",
  logoUrl: "",
  Address: {
    city: "",
    province: "",
    postalCode: "",
    country: "",
    addressLine1: "",
    addressLine2: ""
  }
};

type Props = {
  onSave?: () => void;
  organization?: Organization;
  editing?: boolean;
}

/**
 * A form to edit an organization. If no organization is provided, it will act as a form to create a new organization.
 * If an organization is provided, it will act as a form to view and if the editing prop is true, edit the organization.
 * If the editing prop is false, it will act as a form to view the organization.
 * If the onSave prop is provided, it will be called after the organization is saved/updated.
 */
export default function OrganizationForm({ onSave, organization, editing = true }: Props) {
  const user = useUserStore(state => state.user);
  const toastsStore = useToastsStore(state => state);

  const [organizationData, setOrganization] = useState<Organization>(organization ? { ...emptyOrg, ...organization } : emptyOrg);

  useEffect(() => {
    setOrganization(organization ? { ...emptyOrg, ...organization } : emptyOrg);
  }, [organization]);

  // map of errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // if the logoUrl is a blob, don't allow it to be set
    if (organizationData.logoUrl.startsWith("blob:") || organizationData.logoUrl.startsWith("data:")) {
      setOrganization({ ...organizationData, logoUrl: "" });
      setErrors({ ...errors, logoUrl: "Must be a valid URL to an image" });
    }
  }, [errors, organizationData]);

  const onSubmit = () => {
    updateOrganizationAndPersist(organizationData).then((newOrg) => {
      useUserStore.getState().setCurrentOrganization(newOrg);
      toastsStore.addToast({
        id: "create-org-success",
        title: "Created Organization",
        message: "Successfully created organization " + newOrg.name + "(#" + newOrg.id + ")",
        type: "success"
      });

      if (onSave) onSave();
    }).catch((err) => {
      toastsStore.addToast({
        id: "create-org-error",
        title: "Error",
        message: err.message,
        type: "error"
      });
    });
  };

  return (
    <div className={"flex flex-col gap-4 items-end"}>
      <div>
        <Input label="Name"
               isReadOnly={!editing}
               autoFocus
               isRequired={true}
               startContent={
                 <IconHash
                   className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
               }
               placeholder={(user?.name || "John Doe") + "'s Awesome Organization"}
               variant={editing ? "default" : "underlined"}
               value={organizationData?.name}
               onChange={(e) => setOrganization({ ...organizationData, name: e.target.value })}
               description={"This will be displayed on your invoices and estimates, and cannot be changed later."} />
        <Accordion
          showDivider={true}
          variant="splitted"
          className={"px-0 py-2"}
          itemClasses={{ base: "bg-default-700" }}
        >
          <AccordionItem key="about" aria-label="about" title="About"
                         indicator={<IconChevronLeft />}
                         className={"py-2 px-2"}
                         subtitle={"Tell us about your organization. This information will be displayed on your invoices and estimates."}>
            <div className={"border-none flex flex-col gap-4"}>
              <Input label="Description" placeholder="This is my awesome organization"
                     variant={editing ? "default" : "underlined"}
                     isReadOnly={!editing}
                     value={organizationData.description}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       description: e.target.value
                     })} />
              <Input label="Email" placeholder="contact@cool.org" variant={editing ? "default" : "underlined"}
                     value={organizationData.email}
                     isReadOnly={!editing}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       email: e.target.value
                     })}
                     description={"This is how other's can contact your organization (optional)"} />
              <Input label="Phone" placeholder="(123) 456-7890" variant={editing ? "default" : "underlined"}
                     value={organizationData.phone}
                     isReadOnly={!editing}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       phone: e.target.value
                     })}
                     description={"A phone number for your organization (optional)"} />
            </div>
          </AccordionItem>
          <AccordionItem key="address" aria-label="address" title="Address"
                         indicator={<IconChevronLeft />}
                         subtitle={"Your company's public physical address."}>
            <div className={"border-none flex flex-col gap-2"}>
              <Input label="Address Line 1" placeholder="123 Main St" variant={editing ? "default" : "underlined"}
                     value={organizationData.Address.addressLine1}
                     isReadOnly={!editing}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       Address: {
                         ...organizationData.Address,
                         addressLine1: e.target.value
                       }
                     })} />
              <Input label="Address Line 2" placeholder="Unit 123" variant={editing ? "default" : "underlined"}
                     value={organizationData.Address.addressLine2}
                     isReadOnly={!editing}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       Address: {
                         ...organizationData.Address,
                         addressLine2: e.target.value
                       }
                     })} />
              <Input label="City" placeholder="Toronto" variant={editing ? "default" : "underlined"}
                     value={organizationData.Address.city}
                     isReadOnly={!editing}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       Address: { ...organizationData.Address, city: e.target.value }
                     })} />
              <div className={"flex flex-row gap-2"}>
                <Input label="Province" placeholder="Ontario" variant={editing ? "default" : "underlined"}
                       value={organizationData.Address.province}
                       isReadOnly={!editing}
                       onChange={(e) => setOrganization({
                         ...organizationData,
                         Address: {
                           ...organizationData.Address,
                           province: e.target.value
                         }
                       })} />

                <Input label="Postal Code" placeholder="A1B 2C3" variant={editing ? "default" : "underlined"}
                       value={organizationData.Address.postalCode}
                       isReadOnly={!editing}
                       onChange={(e) => setOrganization({
                         ...organizationData,
                         Address: {
                           ...organizationData.Address,
                           postalCode: e.target.value
                         }
                       })} />
              </div>

              <Input label="Country" placeholder="Canada" variant={editing ? "default" : "underlined"}
                     value={organizationData.Address.country}
                     isReadOnly={!editing}
                     onChange={(e) => setOrganization({
                       ...organizationData,
                       Address: { ...organizationData.Address, country: e.target.value }
                     })} />
            </div>

          </AccordionItem>
        </Accordion>
        <Input label="Logo URL" placeholder="https://cool.org/logo.png" variant={editing ? "default" : "underlined"}
               value={organizationData.logoUrl}
               isReadOnly={!editing}
               onChange={(e) => setOrganization({ ...organizationData, logoUrl: e.target.value })}
               errorMessage={errors["logoUrl"]}
               description={"A URL to your organization's logo (optional)"} />
        {organizationData.logoUrl && (
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
                    src={organizationData.logoUrl}
                  />
                </CardBody>
                <CardFooter className="text-small justify-between select-none">
                  <p>Your Organization's Logo</p>
                  <p className="text-default-500">Preview</p>
                </CardFooter>
              </Card>
            </Card>
          </div>

        )}
      </div>
      <div className={"flex flex-row justify-between w-full items-center"}>
        {organization?.createdAt && (
          <div className={"flex flex-col"}>
            <span className={"text-default-500 text-xs"}>Created {moment(organization?.createdAt).fromNow()}</span>
            <span className={"text-default-500 text-xs"}>Updated {moment(organization?.updatedAt).fromNow()}</span>
          </div>
        )}
        {editing && (
          <Button variant={"flat"} color={"primary"} onPress={() => {
            onSubmit();
          }} className={"hover:bg-primary-50"}>
            {organization?.id ? "Update" : "Create"} Organization
          </Button>
        )}
      </div>
    </div>
  );
}