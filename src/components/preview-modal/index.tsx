import { Modal, ModalContent, ModalBody, Image } from "@heroui/react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  src: string;
  alt?: string;
  isVideo?: boolean;
}

export default function ImagePreviewModal({
  isOpen,
  onOpenChange,
  onClose,
  src,
  alt,
  isVideo = false,
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
              {!isVideo ? (
                <Image src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />
              ) : (
                <video src={src} controls className="max-h-[90vh] max-w-[90vw] object-contain">
                  {alt && <track kind="descriptions" label={alt} />}
                </video>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
