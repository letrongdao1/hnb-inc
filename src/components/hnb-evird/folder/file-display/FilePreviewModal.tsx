import { UploadFile } from "@/interfaces/common";
import { FileTypeEnum } from "@/utils/file.utils";
import { Modal, ModalContent, ModalBody, Image } from "@heroui/react";

interface EvirdFilePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  file?: UploadFile;
}

export default function EvirdFilePreviewModal({
  isOpen,
  onOpenChange,
  onClose,
  file,
}: EvirdFilePreviewModalProps) {
  if (!file) return;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      backdrop="opaque"
      isDismissable={true}
      classNames={{
        backdrop: "bg-linear-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-30",
      }}
      size="full"
    >
      <ModalContent className="relative bg-transparent shadow-none">
        {() => (
          <>
            <div className="absolute inset-0" onClick={onClose} />

            <ModalBody className="flex items-center justify-center p-0">
              {file.type === FileTypeEnum.IMAGE ? (
                <Image
                  src={file.url}
                  alt={file.url}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              ) : (
                file.type === FileTypeEnum.VIDEO && (
                  <video
                    src={file.url}
                    autoPlay={isOpen}
                    muted
                    playsInline
                    controls
                    className="max-h-[90vh] max-w-[90vw] object-contain"
                  >
                    {file.url && <track kind="descriptions" label={file.url} />}
                  </video>
                )
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
