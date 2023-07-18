import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { IconHash } from "@tabler/icons-react";
import { Divider } from "@nextui-org/divider";
import { Spacer } from "@nextui-org/spacer";
import { useState } from "react";
import { useToastsStore } from "@/services/toast";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  onOpen: () => void;
}

/**
 * This is the modal for joining an organization. This is a controlled component and can be opened and closed via the isOpen prop.
 * Right now only the form is implemented. The actual API call to join an organization is not implemented yet.
 * The user should be able to join an organization via a join code or a link which will be provided by the organization.
 * TODO: Create the Organization service to handle CRUD operations for organizations.
 */
export default function JoinOrganizationModal({ isOpen, onOpenChange }: Props) {
  const [joinCode, setJoinCode] = useState("");
  const toastsStore = useToastsStore(state => state);
  const onSubmit = () => {
    console.log("TODO: Join organization");
    toastsStore.addToast({
      id: "join-organization",
      title: "Join Organization",
      message: "TODO: Not implemented yet",
      type: "error"
    });
  };

  return (
    <>
      <Modal
        className={"select-none"}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop={"opaque"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Join an Organization</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  startContent={
                    <IconHash className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                  }
                  label="Join Code"
                  placeholder="513123"
                  variant="bordered"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <p className="text-sm text-default-500 font-medium">
                  Join codes should look like
                  <span className="text-xs text-default-500 font-normal">
                    <br />• #123456<br />• 123456<br />• contractrpro.com/join/123456
                  </span>
                </p>

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
                  Join Organization
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}