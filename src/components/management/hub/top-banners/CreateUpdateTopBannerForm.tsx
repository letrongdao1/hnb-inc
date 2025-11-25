"use client";

import React, {  useState } from "react";
import { FieldErrorText, PageTitle } from "@/components/ui/text";
import {
  addToast,
  Button,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ImageUploading, { ImageListType, ImageType } from "react-images-uploading";
import {
  ArrowLeftIcon,
  CursorIcon,
  DeleteIcon,
  EditIcon,
  ExclamationIcon,
  HandIcon,
} from "@/components/svg";
import { STATUS_CODE, TOP_BANNER_TYPE } from "@/constants/enums";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import { getLocalTimeZone, parseAbsoluteToLocal, today } from "@internationalized/date";
import imageCompression from "browser-image-compression";
import { IMAGE_COMPRESS_OPTIONS } from "@/constants/constants";
import { TopBanner } from "@/interfaces/common";
import BannerCropModal from "./BannerCropModal";

type CreateBannerFieldProps = yup.InferType<typeof schema>;

const INPUT_MAX_LENGTH = {
  title: 50,
  content: 300,
  extra: 100,
};

const schema = yup
  .object({
    title: yup
      .string()
      .max(INPUT_MAX_LENGTH.title, `Chỉ chứa tối đa ${INPUT_MAX_LENGTH.title} ký tự`)
      .required("Vui lòng nhập tên banner")
      .trim(),
    content: yup
      .string()
      .max(INPUT_MAX_LENGTH.content, `Chỉ chứa tối đa ${INPUT_MAX_LENGTH.content} ký tự`)
      .required("Vui lòng nhập mô tả nội dung banner")
      .trim(),
    extra: yup.string().nullable(),
    type: yup.mixed<TOP_BANNER_TYPE>().oneOf(Object.values(TOP_BANNER_TYPE)),
    active_at: yup.string().required("Vui lòng chọn thời gian bắt đầu"),
    expired_at: yup.string().nullable(),
  })
  .required();

export default function CreateUpdateTopBannerForm({
  fetchBannerList,
  editedBanner,
}: {
  fetchBannerList: () => Promise<void>;
  editedBanner?: TopBanner;
}) {
  const router = useRouter();
  const { loading, setLoading } = useLoading();

  const [images, setImages] = useState<ImageListType>([]);
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    editedBanner?.image || undefined
  );
  const [currentCropImage, setCurrentCropImage] = useState<ImageType>();
  const cropModal = useDisclosure();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateBannerFieldProps>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      ...editedBanner,
      type: editedBanner && editedBanner.type,
      active_at:
        editedBanner && editedBanner.active_at
          ? (parseAbsoluteToLocal(editedBanner.active_at) as any)
          : undefined,
    },
  });

  const watcher = {
    title: {
      length: watch("title")?.trim().length,
      isExceeded: watch("title")?.trim().length > INPUT_MAX_LENGTH.title,
    },
    content: {
      length: watch("content")?.trim().length,
      isExceeded: watch("content")?.trim().length > INPUT_MAX_LENGTH.content,
    },
    extra: {
      length: watch("extra")?.trim().length,
      isNull: !watch("extra")?.trim().length,
    },
  };

  const handleUploadChange = async (
    imageList: ImageListType,
    _addUpdateIndex: number[] | undefined
  ) => {
    if (!imageList || !imageList.length) return;

    const parsedImageList = await Promise.all(
      imageList.map(async (img) => {
        if (!img.file) return img;

        const compressedFile = await imageCompression(img.file, IMAGE_COMPRESS_OPTIONS);
        const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
        return {
          dataURL: base64,
          file: compressedFile,
        };
      })
    );

    setCurrentCropImage(parsedImageList[0]);
    cropModal.onOpen();
  };

  const handleFinishCrop = (image: ImageType) => {
    setImages([image]);
    cropModal.onClose();
  };

  const handleCreateBanner = async (data: CreateBannerFieldProps) => {
    setLoading(true);

    let image: string = "";

    if (images && images.length && images[0].dataURL && images[0].file) {
      await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: images[0].dataURL,
          fileName: images[0].file.name,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            image = result.data || "";
          }
        })
        .catch((error) => {
          console.log({ error });
          return addToast({
            title: "Tải ảnh lên thất bại!",
            color: "danger",
          });
        });
    }

    const values: Partial<TopBanner> = {
      ...data,
      extra: data.extra || "",
      type: (data.type as TOP_BANNER_TYPE) || TOP_BANNER_TYPE.SYSTEM,
      expired_at: data.expired_at || undefined,
      image,
    };

    await fetch("/api/top-banners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.CREATED) {
          addToast({
            title: result.message,
            color: "success",
          });
          fetchBannerList();
          router.push("/management/hub/top-banners");
        } else {
          throw new Error(result.message);
        }
      })
      .catch((err) => {
        addToast({
          title: err,
          color: "danger",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateBanner = async (data: CreateBannerFieldProps) => {
    if (!editedBanner) {
      return addToast({
        title: "Không tìm thấy banner!",
        color: "danger",
      });
    }

    let image: string = editedBanner.image || "";

    if (images && images.length && images[0].dataURL && images[0].file) {
      await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: images[0].dataURL,
          fileName: images[0].file.name,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            image = result.data || "";
          }
        })
        .catch((error) => {
          console.log({ error });
          return addToast({
            title: "Tải ảnh lên thất bại!",
            color: "danger",
          });
        });
    }

    setLoading(true);

    const values = {
      ...data,
      image,
      active_at: data.active_at.split("[")?.[0],
    };

    await fetch("/api/top-banners", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          addToast({
            title: result.message,
            color: "success",
          });
          fetchBannerList();
          router.push("/management/hub/top-banners");
        } else {
          addToast({
            title: "Lỗi cập nhật banner",
            color: "danger",
          });
        }
      })
      .catch(() => {
        addToast({
          title: "Lỗi cập nhật banner",
          color: "danger",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex w-full flex-col gap-8 px-2 md:px-4">
      <div className="flex items-center justify-center gap-2">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          startContent={<ArrowLeftIcon />}
        />
        <div className="flex flex-1 items-center justify-center gap-2 text-center">
          <p className="text-xl font-bold uppercase md:text-2xl">
            {editedBanner ? "Cập nhật" : "Tạo"} banner
          </p>
          <Tooltip
            content={
              <p className="mx-auto text-sm font-light">
                Banner được hiển thị phía trên thanh điều hướng với mục đích thông báo đến người
                dùng bằng nội dung và thông điệp ngắn gọn.
              </p>
            }
          >
            <ExclamationIcon />
          </Tooltip>
        </div>
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          startContent={<ArrowLeftIcon />}
          className="invisible"
        />
      </div>

      <form
        onSubmit={handleSubmit(editedBanner ? handleUpdateBanner : handleCreateBanner)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <div className="space-y-0.5">
            <Input
              {...register("title", { required: true })}
              label={"Tiêu đề banner"}
              isRequired
              isInvalid={!!errors.title}
              endContent={
                <p className={`text-xs opacity-75 ${watcher.title.isExceeded && "text-red-500"}`}>
                  {watcher.title.length}/{INPUT_MAX_LENGTH.title}
                </p>
              }
            />
            <FieldErrorText>{errors.title?.message}</FieldErrorText>
          </div>

          <div className="space-y-0.5">
            <Textarea
              {...register("content", { required: true })}
              label={"Nội dung banner"}
              placeholder="Nhập nội dung ngắn gọn..."
              isRequired
              isInvalid={!!errors.content}
              endContent={
                <p className={`text-xs opacity-75 ${watcher.content.isExceeded && "text-red-500"}`}>
                  {watcher.content.length}/{INPUT_MAX_LENGTH.content}
                </p>
              }
              isClearable={watcher.content.length > 0}
              minRows={1}
              maxRows={4}
              spellCheck="false"
            />
            <FieldErrorText>{errors.content?.message}</FieldErrorText>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-1 md:flex-row">
            <div className="flex-1 space-y-0.5">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    label={"Loại banner"}
                    isRequired
                    isInvalid={!!errors.type}
                    selectedKeys={[field.value as any]}
                    onChange={field.onChange}
                    items={Object.values(TOP_BANNER_TYPE).map((type) => ({
                      label: getTranslatedBannerTypeName(type),
                      value: type,
                    }))}
                  >
                    {(type) => <SelectItem key={type.value}>{type.label}</SelectItem>}
                  </Select>
                )}
              />

              <FieldErrorText>{errors.type?.message}</FieldErrorText>
            </div>

            <div className="flex-1 space-y-0.5">
              <Controller
                control={control}
                name="active_at"
                render={({ field }) => (
                  <DatePicker
                    label={"Thời gian bắt đầu hiển thị"}
                    isRequired
                    isInvalid={!!errors.active_at}
                    value={field.value as any}
                    onChange={field.onChange}
                    hideTimeZone
                    granularity={"minute"}
                    minValue={today(getLocalTimeZone())}
                  />
                )}
              />

              <FieldErrorText>{errors.active_at?.message}</FieldErrorText>
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-1 md:flex-row">
            <div className="flex-1 space-y-0.5">
              <div className="flex flex-col items-stretch gap-2 md:flex-row">
                <Input
                  {...register("extra", { required: true })}
                  label={"Thông tin thêm"}
                  isInvalid={!!errors.extra}
                  className="flex-8"
                />
              </div>
            </div>

            <div className="flex-1 space-y-0.5">
              <Controller
                control={control}
                name="expired_at"
                render={({ field }) => (
                  <DatePicker
                    label={"Hết hạn"}
                    isInvalid={!!errors.expired_at}
                    value={field.value as any}
                    onChange={field.onChange}
                    hideTimeZone
                    granularity={"minute"}
                    minValue={today(getLocalTimeZone())}
                  />
                )}
              />

              <FieldErrorText>{errors.expired_at?.message}</FieldErrorText>
            </div>
          </div>

          <ImageUploading value={images} onChange={handleUploadChange} dataURLKey="dataURL">
            {({ imageList, onImageUpload, onImageUpdate, isDragging, dragProps }) => (
              <div className="mx-auto space-y-1">
                <Button
                  {...dragProps}
                  onPress={onImageUpload}
                  variant="flat"
                  className={`h-56 w-full rounded-md border border-dashed bg-contain bg-center bg-no-repeat duration-200 ${(isDragging || !!imageList.length) && "border-solid"}`}
                  style={{
                    backgroundImage: `url(${imageList?.[0]?.["dataURL"] || (editedBanner && currentImage)})`,
                  }}
                >
                  <div
                    className={`text-center ${(!!imageList.length || (editedBanner && currentImage)) && "hidden"}`}
                  >
                    <p className="text-lg font-semibold">
                      Ảnh nền banner <span className="text-sm opacity-75">(không bắt buộc)</span>
                    </p>
                    <span
                      className={`flex items-center gap-1 opacity-50 duration-200 ${isDragging && "opacity-100"}`}
                    >
                      {isDragging ? <HandIcon /> : <CursorIcon size={16} />}
                      {isDragging
                        ? "Thả vào đây để tải ảnh lên"
                        : "Nhấn hoặc kéo thả để tải ảnh lên"}
                    </span>
                  </div>
                </Button>
                <div
                  className={`flex flex-col items-stretch gap-1 md:flex-row ${!imageList.length && !currentImage && "hidden"}`}
                >
                  <Button
                    fullWidth
                    color="secondary"
                    variant="bordered"
                    onPress={() => onImageUpdate(0)}
                    startContent={<EditIcon />}
                    className="flex-3 py-2"
                  >
                    Thay đổi ảnh
                  </Button>
                  <Button
                    isIconOnly
                    fullWidth
                    color="danger"
                    variant="bordered"
                    onPress={() => {
                      console.log({ imageList });
                      if (!!imageList.length) setImages([]);
                      else {
                        setCurrentImage(undefined);
                      }
                    }}
                    startContent={<DeleteIcon />}
                    className="w-full flex-1 py-2"
                  />
                </div>
              </div>
            )}
          </ImageUploading>

          {currentCropImage && (
            <BannerCropModal
              image={currentCropImage}
              isOpen={cropModal.isOpen}
              onOpenChange={cropModal.onOpenChange}
              onFinish={handleFinishCrop}
            />
          )}
        </div>

        <Button isLoading={loading} type="submit" fullWidth className="mt-4" color="success">
          Hoàn tất
        </Button>
      </form>
    </div>
  );
}

export const getTranslatedBannerTypeName = (type: TOP_BANNER_TYPE) => {
  switch (type) {
    case TOP_BANNER_TYPE.SYSTEM:
      return "Hệ thống";
    case TOP_BANNER_TYPE.HOLIDAY:
      return "Holiday";
    case TOP_BANNER_TYPE.REMINDER:
      return "Nhắc nhở";
    default:
      return type;
  }
};
