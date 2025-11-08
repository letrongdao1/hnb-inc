"use client";

import React, { useEffect, useState } from "react";
import { FieldErrorText, PageTitle } from "@/components/ui/text/text";
import { Event, EventTag } from "@/interfaces/events";
import {
  addToast,
  Button,
  Checkbox,
  DateInput,
  DatePicker,
  Image,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Textarea,
  TimeInput,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ImageUploading, { ImageListType } from "react-images-uploading";
import {
  ArrowLeftIcon,
  BeerIcon,
  CheckIcon,
  CursorIcon,
  DeleteIcon,
  EditIcon,
  HandIcon,
  PlusIcon,
  SparkleIcon,
  XIcon,
} from "@/components/svg";
import { CommonUtils } from "@/utils/common.utils";
import { motion, AnimatePresence } from "framer-motion";
import { STATUS_CODE } from "@/constants/enums";
import { useLoading } from "@/hooks/useLoading";
import { useRouter } from "next/navigation";
import { parseDate, parseTime } from "@internationalized/date";
import imageCompression from "browser-image-compression";
import { IMAGE_COMPRESS_OPTIONS } from "@/constants/constants";

type CreateEventFieldProps = yup.InferType<typeof schema>;

const INPUT_MAX_LENGTH = {
  title: 50,
  venue_name: 150,
  description: 500,
};

const schema = yup
  .object({
    title: yup
      .string()
      .max(INPUT_MAX_LENGTH.title, `Chỉ chứa tối đa ${INPUT_MAX_LENGTH.title} ký tự`)
      .required("Vui lòng nhập tên sự kiện")
      .trim(),
    description: yup
      .string()
      .max(INPUT_MAX_LENGTH.description, `Chỉ chứa tối đa ${INPUT_MAX_LENGTH.description} ký tự`)
      .required("Vui lòng nhập mô tả nội dung sự kiện")
      .trim(),
    venue_name: yup
      .string()
      .max(INPUT_MAX_LENGTH.venue_name, `Chỉ chứa tối đa ${INPUT_MAX_LENGTH.venue_name} ký tự`)
      .required("Vui lòng nhập địa điểm sự kiện"),
    venue_instruction: yup.string().url("URL không hợp lệ").nullable(),
    start_date: yup.date().required("Vui lòng chọn ngày bắt đầu"),
    start_time: yup.string().required("Vui lòng chọn giờ bắt đầu"),
    tags: yup.string(),
    has_alcohol: yup.bool(),
  })
  .required();

export default function CreateUpdateEventForm({
  fetchEventList,
  editedEvent,
}: {
  fetchEventList: () => Promise<void>;
  editedEvent?: Event;
}) {
  const router = useRouter();
  const { loading, setLoading } = useLoading();

  const [tags, setTags] = useState<EventTag[]>([]);

  const [images, setImages] = useState<ImageListType>([]);
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    editedEvent?.image || undefined
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateEventFieldProps>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      ...editedEvent,
      start_date:
        editedEvent && editedEvent.start_date
          ? (parseDate(editedEvent.start_date) as any)
          : undefined,
      start_time:
        editedEvent && editedEvent.start_time
          ? (parseTime(editedEvent.start_time) as any)
          : undefined,
      tags: editedEvent && editedEvent.tags ? editedEvent.tags : "",
    },
  });

  const watcher = {
    title: {
      length: watch("title")?.trim().length,
      isExceeded: watch("title")?.trim().length > INPUT_MAX_LENGTH.title,
    },
    description: {
      length: watch("description")?.trim().length,
      isExceeded: watch("description")?.trim().length > INPUT_MAX_LENGTH.description,
    },
    venue_name: {
      length: watch("venue_name")?.trim().length,
      isExceeded: watch("venue_name")?.trim().length > INPUT_MAX_LENGTH.venue_name,
    },
    venue_instruction: {
      isProvided: Boolean(watch("venue_instruction")?.trim().length),
    },
    has_alcohol: {
      isChecked: Boolean(watch("has_alcohol")),
    },
  };

  useEffect(() => {
    const fetchTagList = async () => {
      await fetch("/api/events/tags")
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            setTags(result.data);
          }
        });
    };

    fetchTagList();
  }, []);

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
          data_url: base64,
          file: compressedFile,
        };
      })
    );

    setImages(parsedImageList);
  };

  const hanldeCreateEvent = async (data: CreateEventFieldProps) => {
    const values = {
      ...data,
      start_date: CommonUtils.getDateString(data.start_date),
    };
    setLoading(true);

    let image: string = "";

    if (images && images.length && images[0].data_url && images[0].file) {
      await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: images[0].data_url,
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

    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, image, slug: CommonUtils.generateSlug(values.title) }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.CREATED) {
          addToast({
            title: result.message,
            color: "success",
          });
        }
        fetchEventList();
        router.push("/management/hub?tab=events");
      })
      .catch((err) => {
        addToast({
          title: "Lỗi tạo sự kiện",
          color: "danger",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const hanldeUpdateEvent = async (data: CreateEventFieldProps) => {
    if (!editedEvent) {
      return addToast({
        title: "Không tìm thấy sự kiện!",
        color: "danger",
      });
    }

    let image: string = "";

    if (images && images.length && images[0].data_url && images[0].file) {
      await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: images[0].data_url,
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
      id: editedEvent.id,
      slug: editedEvent.slug,
      ...data,
      image,
      start_date: CommonUtils.getDateString(data.start_date),
    };

    await fetch("/api/events", {
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
        }
        fetchEventList();
        router.push("/management/hub?tab=events");
      })
      .catch((err) => {
        addToast({
          title: "Lỗi cập nhật sự kiện",
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
        <div className="flex-1 text-center">
          <p className="text-xl font-bold uppercase md:text-2xl">
            {editedEvent ? "Cập nhật" : "Tạo"} sự kiện
          </p>
        </div>
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          startContent={<ArrowLeftIcon />}
          className="invisible"
        />
      </div>

      <form onSubmit={handleSubmit(hanldeCreateEvent)} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-light">Thông tin chính</p>

          <div className="space-y-0.5">
            <Input
              {...register("title", { required: true })}
              label={"Tên sự kiện"}
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
              {...register("description", { required: true })}
              label={"Mô tả nội dung sự kiện"}
              placeholder="Nhập mô tả..."
              isRequired
              isInvalid={!!errors.description}
              endContent={
                <p
                  className={`text-xs opacity-75 ${watcher.description.isExceeded && "text-red-500"}`}
                >
                  {watcher.description.length}/{INPUT_MAX_LENGTH.description}
                </p>
              }
              isClearable={watcher.description.length > 0}
              minRows={4}
              maxRows={4}
              spellCheck="false"
            />
            <FieldErrorText>{errors.description?.message}</FieldErrorText>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-light">Địa điểm & thời gian</p>
          <div className="space-y-0.5">
            <div className="flex flex-col items-stretch gap-2 md:flex-row">
              <Input
                {...register("venue_name", { required: true })}
                label={"Địa điểm"}
                isRequired
                isInvalid={!!errors.venue_name}
                endContent={
                  <p
                    className={`text-xs opacity-75 ${watcher.venue_name.isExceeded && "text-red-500"}`}
                  >
                    {watcher.venue_name.length}/{INPUT_MAX_LENGTH.venue_name}
                  </p>
                }
                className="flex-8"
              />

              <Popover placement="top" showArrow={true} className="">
                <PopoverTrigger>
                  <Button
                    variant={!!errors.venue_instruction ? "ghost" : "light"}
                    color={!!errors.venue_instruction ? "danger" : "secondary"}
                    startContent={
                      errors.venue_instruction ? (
                        <XIcon size={16} />
                      ) : watcher.venue_instruction.isProvided ? (
                        <CheckIcon />
                      ) : (
                        <PlusIcon />
                      )
                    }
                    className="my-auto flex-1 py-2 font-semibold"
                  >
                    {errors.venue_instruction
                      ? "Xem lỗi"
                      : watcher.venue_instruction.isProvided
                        ? "Xem link"
                        : "Link chỉ dẫn"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="w-64 space-y-1 px-1 py-2">
                    <p className="text-small mb-1 font-bold">Link dẫn đường đến địa điểm:</p>
                    <Textarea
                      {...register("venue_instruction")}
                      placeholder="Dán link Google Map vào đây..."
                      isInvalid={!!errors.venue_instruction}
                      className="text-tiny"
                      maxRows={4}
                    />
                    <FieldErrorText>{errors.venue_instruction?.message}</FieldErrorText>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <FieldErrorText>{errors.venue_name?.message}</FieldErrorText>
          </div>

          <div className="flex flex-col items-stretch gap-2 md:flex-row">
            <div className="flex-1 space-y-0.5">
              <Controller
                control={control}
                name="start_date"
                render={({ field }) => (
                  <DatePicker
                    label={"Ngày bắt đầu"}
                    isRequired
                    isInvalid={!!errors.start_date}
                    value={field.value as any}
                    onChange={field.onChange}
                  />
                )}
              />

              <FieldErrorText>{errors.start_date?.message}</FieldErrorText>
            </div>
            <div className="flex-1 space-y-0.5">
              <Controller
                control={control}
                name="start_time"
                render={({ field }) => (
                  <TimeInput
                    label={"Giờ bắt đầu (ước tính)"}
                    isInvalid={!!errors.start_time}
                    isRequired
                    value={field.value as any}
                    onChange={field.onChange}
                  />
                )}
              />

              <FieldErrorText>{errors.start_time?.message}</FieldErrorText>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-light">Thông tin khác</p>

          <ImageUploading value={images} onChange={handleUploadChange} dataURLKey="data_url">
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              onImageUpdate,
              //   onImageRemove,
              isDragging,
              dragProps,
            }) => (
              <div className="mx-auto space-y-1">
                <Button
                  {...dragProps}
                  onPress={onImageUpload}
                  variant="flat"
                  className={`h-56 w-full rounded-md border border-dashed bg-contain bg-center bg-no-repeat duration-200 ${(isDragging || !!imageList.length) && "border-solid"}`}
                  style={{
                    backgroundImage: `url(${imageList?.[0]?.["data_url"] || (editedEvent && currentImage)})`,
                  }}
                >
                  <div
                    className={`text-center ${(!!imageList.length || (editedEvent && currentImage)) && "hidden"}`}
                  >
                    <p className="text-lg font-semibold">
                      Ảnh nền sự kiện <span className="text-sm opacity-75">(không bắt buộc)</span>
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
                <div className={`flex flex-col items-stretch gap-1 md:flex-row`}>
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
                      if (!!imageList.length) onImageRemoveAll();
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

          <div className="space-y-0.5">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <Select
                  label={"Hashtag"}
                  selectionMode="multiple"
                  isInvalid={!!errors.tags}
                  value={field.value}
                  onChange={field.onChange}
                  startContent={"#"}
                >
                  {tags.map((tag) => (
                    <SelectItem key={tag.tag_name}>{tag.tag_name}</SelectItem>
                  ))}
                </Select>
              )}
            />

            <FieldErrorText>{errors.tags?.message}</FieldErrorText>
          </div>

          <div className="flex flex-1 items-center justify-start space-y-0.5 py-2">
            <Controller
              control={control}
              name="has_alcohol"
              render={({ field }) => (
                <Checkbox
                  color="secondary"
                  isInvalid={!!errors.has_alcohol}
                  isSelected={field.value}
                  onChange={field.onChange}
                >
                  <span className="relative flex items-center gap-2">
                    Có sử dụng bia, rượu
                    <motion.div
                      className="relative flex items-center justify-center"
                      animate={{ rotate: field.value ? -15 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <BeerIcon
                        className={`h-6 w-6 rotate-y-180 transition-all duration-200 ${
                          field.value ? "text-amber-500 opacity-100" : "opacity-50"
                        }`}
                      />

                      <AnimatePresence>
                        {field.value && (
                          <>
                            <motion.div
                              key="beer2"
                              initial={{ opacity: 0, x: 40, rotate: 0, scale: 0.5 }}
                              animate={{ opacity: 1, x: 18, rotate: 15, scale: 1 }}
                              exit={{ opacity: 0, x: 40, scale: 0.5 }}
                              transition={{ type: "spring", stiffness: 300, damping: 15 }}
                              className="absolute right-0"
                            >
                              <BeerIcon className="h-6 w-6 text-amber-600" />
                            </motion.div>

                            <motion.div
                              key="sparkle"
                              className="absolute bottom-2 left-3 z-50"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.2, 0],
                                rotate: [0, 45, 90],
                              }}
                              transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: 0.4,
                              }}
                            >
                              <SparkleIcon className="text-yellow-400" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {!field.value && (
                          <motion.div
                            key="xmark"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 250, damping: 18 }}
                            className="absolute"
                          >
                            <XIcon className="text-red-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </span>
                </Checkbox>
              )}
            />

            <FieldErrorText>{errors.start_time?.message}</FieldErrorText>
          </div>
        </div>

        <Button isLoading={loading} type="submit" fullWidth className="mt-4" color="success">
          Hoàn tất
        </Button>
      </form>
    </div>
  );
}
