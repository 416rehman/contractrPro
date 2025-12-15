import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import OrganizationForm from "@/components/organizationForm";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
}

/**
 * This is the modal for creating an organization. This is a controlled component and can be opened and closed via the isOpen prop.
 * Right now only the form is implemented. The actual API call to create an organization is not implemented yet.
 */
export default function OrganizationModal({ isOpen, onOpenChange }: Props) {
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
                <OrganizationForm onSave={onClose} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}