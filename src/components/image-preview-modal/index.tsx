import { Modal, ModalContent, ModalBody, Image } from "@heroui/react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  src: string;
  alt?: string;
}

export default function ImagePreviewModal({
  isOpen,
  onOpenChange,
  onClose,
  src,
  alt,
}: ImagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={() => {
        onClose?.();
      }}
      backdrop="opaque"
      classNames={{
        backdrop: "bg-linear-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-30",
      }}
      size="full"
    >
      <ModalContent className="bg-transparent shadow-none" onClick={onClose}>
        {() => (
          <>
            <ModalBody className="flex items-center justify-center p-0">
              <Image src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
