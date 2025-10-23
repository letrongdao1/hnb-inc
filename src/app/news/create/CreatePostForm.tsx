"use client";

import { useMemo, useRef, useState } from "react";
import { PageTitle } from "@/components/text/text";
import { addToast, Button, DatePicker, Image, Input, Switch, useDisclosure } from "@heroui/react";
import { ArrowLeftIcon, DeleteDocumentIcon, PlusIcon } from "@/components/svg";
import RichTextEditor from "@/components/rich-text/RichTextEditor";
import dayjs from "dayjs";
import FIRE_ICON from "@/assets/icons/fire-svgrepo-com.svg";
import { PostInfo } from "@/interfaces/news";
import { useUser } from "@/providers/user.providers";
import { createNewPost, uploadPostImage } from "./page";
import { STATUS_CODE } from "@/constants/enums";
import { useRouter } from "next/navigation";
import { CommonUtils } from "@/utils/common.utils";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { useLoading } from "@/hooks/useLoading";
import { now, getLocalTimeZone, today, ZonedDateTime } from "@internationalized/date";
import { SUPABASE_DATE_FORMAT } from "@/constants/constants";

const DEFAULT_TITLE = `Bản tin ngày ${dayjs().format("DD/MM/YYYY")}`;

export default function CreatePostForm() {
  const { user } = useUser();
  const router = useRouter();

  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onClose: onCloseConfirm,
    onOpenChange: onOpenChangeConfirm,
  } = useDisclosure();

  const { loading, withLoading } = useLoading();

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [content, setContent] = useState("");
  const [activeAt, setActiveAt] = useState<ZonedDateTime>(now(getLocalTimeZone()));
  const [isHot, setIsHot] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const imageURL = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);

  const uploadRef = useRef<HTMLInputElement>(null);

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    if (!fileList || !fileList.length) return;

    setImageFile(fileList[0]);
  };

  const handleValidate = () => {
    const warning = (title: string, description?: string) => {
      addToast({
        title,
        description,
        color: "warning",
      });
    };

    console.log(content.length)

    if (!title) return warning("Vui lòng nhập tiêu đề cho bản tin!");
    else if (!content) return warning("Vui lòng nhập nội dung cho bản tin!");
    else if (content.length >= 6000)
      return warning(
        "Nội dung bản tin quá dài!",
        "Nội dung chỉ nên chứa dưới 1000 từ. Vui lòng sử dụng câu từ chắt lọc, cô đọng!"
      );

    return true;
  };

  const handleCreateNewPost = async () => {
    if (!user) return;

    withLoading(async () => {
      let finalImage = "";

      if (imageFile)
        await uploadPostImage(imageFile).then((res) => {
          if (res) {
            if (res.status === STATUS_CODE.OK) {
              finalImage = res.data;
            }
          }
        });

      const newPost: Partial<PostInfo> = {
        user: { id: user.id },
        title,
        slug: CommonUtils.generateSlug(title),
        content,
        description: "",
        image: finalImage,
        active_at: activeAt.toAbsoluteString(),
        is_hot: isHot,
      };

      const response = await createNewPost(newPost);

      if (response.status === STATUS_CODE.CREATED) {
        addToast({
          title: "Tạo bản tin thành công",
          description: "Hệ thống sẽ tự động đăng bản tin lên Bảng tin HNB.",
          color: "success",
        });
        router.replace("/news");
      } else {
        addToast({
          title: "Tạo bản tin lỗi",
          color: "danger",
        });
      }

      onCloseConfirm();
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <div className="hidden flex-1 md:inline">
          <Button
            variant="light"
            onPress={() => router.replace("/news")}
            startContent={<ArrowLeftIcon />}
            className="w-fit border-none text-inherit"
          >
            Quay lại
          </Button>
        </div>
        <div className="flex-1 text-center">
          <PageTitle className="">Đăng bản tin</PageTitle>
        </div>
        <div className="hidden flex-1 md:inline" />
      </div>

      <div className="space-y-2">
        <Input
          label="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className=""
          disableAnimation={false}
          variant="bordered"
          labelPlacement="outside"
          maxLength={200}
        />
      </div>

      <div className="flex w-full items-center justify-center space-y-2">
        <input type="file" hidden ref={uploadRef} onChange={handleUploadChange} accept="image/*" />
        {imageFile ? (
          <div className="group relative w-56 duration-200">
            <Image src={imageURL} alt="upload-image" />
            <span
              onClick={() => setImageFile(null)}
              className="absolute top-1 right-1 z-50 hidden cursor-pointer rounded-full bg-white p-1 text-red-500 group-hover:flex hover:brightness-75"
            >
              <DeleteDocumentIcon />
            </span>
          </div>
        ) : (
          <div
            onClick={() => {
              if (uploadRef && uploadRef.current) {
                uploadRef.current.click();
              }
            }}
            className="flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 duration-200 hover:opacity-75"
          >
            <PlusIcon />
            <div className="inline items-center gap-2 sm:flex">
              <em>Tải ảnh hoặc tệp GIF làm bìa của bản tin</em>{" "}
              <p className="inline text-xs">(không bắt buộc)</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <RichTextEditor setContent={setContent} placeholder="Nhập nội dung bản tin..." />
      </div>

      <div className="flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <DatePicker
          hideTimeZone
          value={activeAt}
          onChange={(value) => {
            if (value) setActiveAt(value);
          }}
          label="Chọn thời điểm đăng bản tin"
          variant="bordered"
          labelPlacement="outside"
          hourCycle={24}
          isDateUnavailable={(date) => {
            return date < today(getLocalTimeZone());
          }}
          className="max-w-[284px]"
        />

        <Switch
          checked={isHot}
          onChange={(e) => {
            setIsHot(e.target.checked);
          }}
          color="danger"
          className="flex items-center gap-2"
          thumbIcon={({ isSelected }) =>
            isSelected ? (
              <Image src={FIRE_ICON.src} alt="fire" className="aspect-square w-8" />
            ) : null
          }
        >
          Tin HOT
        </Switch>
      </div>

      <Button
        color="primary"
        onPress={() => {
          const validated = handleValidate();
          if (validated) onOpenConfirm();
        }}
        isLoading={loading}
      >
        Hoàn tất
      </Button>

      <ConfirmModal
        open={isOpenConfirm}
        onOpenChange={onOpenChangeConfirm}
        onClose={onCloseConfirm}
        onConfirm={handleCreateNewPost}
        title={"Xác nhận tạo bản tin"}
        description={"Đảm bảo rằng thông tin của bản tin hoàn toàn chính xác trước khi tạo!"}
        extra={"Thao tác này không thể hoàn tác."}
        confirmText="Tạo bản tin"
        modalProps={{
          size: "lg",
          placement: "center",
        }}
        loading={loading}
      />
    </div>
  );
}
