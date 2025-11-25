import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
// import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { ImageType } from "react-images-uploading";

const DEFAULT_CROP: Crop = {
  x: 0,
  y: 50,
  width: 100,
  height: 20,
  unit: "%",
};

export default function BannerCropModal({
  image,
  isOpen,
  onOpenChange,
  onFinish,
}: {
  image: ImageType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (image: ImageType) => void;
}) {
  const [crop, setCrop] = useState<Crop>(DEFAULT_CROP);

  useEffect(() => {
    const handleChangeCropRatio = () => {
      setCrop(DEFAULT_CROP);
    };

    window.addEventListener("resize", handleChangeCropRatio);

    return () => {
      window.removeEventListener("resize", handleChangeCropRatio);
    };
  });

  const imgRef = useRef<HTMLImageElement | null>(null);

  const getCroppedImage = useCallback(async () => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelWidth = crop.width * scaleX;
    const pixelHeight = crop.height * scaleY;

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      pixelWidth,
      pixelHeight,
      0,
      0,
      pixelWidth,
      pixelHeight
    );

    const base64 = canvas.toDataURL("image/png");

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;

    const file = new File([blob], "cropped.png", { type: "image/png" });

    const result: ImageType = {
      file,
      dataURL: base64,
    };

    return result;
  }, [crop]);

  const handleConfirm = async () => {
    const result = await getCroppedImage();
    if (!result) return;

    onFinish(result);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      placement="bottom-center"
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader />
            <ModalBody>
              {image.file && (
                <ReactCrop crop={crop} aspect={10 / 1} locked onChange={(c) => setCrop(c)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={URL.createObjectURL(image.file)}
                    alt="crop"
                    className="mx-auto w-full object-contain"
                  />
                </ReactCrop>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="solid" color="primary" onPress={handleConfirm}>
                Hoàn tất
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
