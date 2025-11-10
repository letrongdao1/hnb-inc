"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addToast, Avatar, Button, DatePicker, Image, Input, useDisclosure } from "@heroui/react";
import {
  ArrowLeftIcon,
  CheckIcon,
  CursorIcon,
  DeleteIcon,
  EditIcon,
  HandIcon,
  PlusIcon,
} from "@/components/svg";
import dayjs from "dayjs";
import FIRE_ICON from "@/assets/icons/fire-svgrepo-com.svg";
import { PostInfo } from "@/interfaces/news";
import { STATUS_CODE } from "@/constants/enums";
import { useRouter } from "next/navigation";
import { CommonUtils } from "@/utils/common.utils";
import ConfirmModal from "@/components/ui/Modal/ConfirmModal";
import { useLoading } from "@/hooks/useLoading";
import {
  now,
  getLocalTimeZone,
  today,
  ZonedDateTime,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import SwitchCard from "@/components/ui/SwitchCard";
import { MentionsInput, Mention } from "react-mentions";
import { Theme, SuggestionMode } from "emoji-picker-react";
import { RoleInfo } from "@/interfaces/user";
import mentionInputStyle from "@/styles/mentionInputStyle";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import ImageUploading, { ImageListType } from "react-images-uploading";
import imageCompression from "browser-image-compression";
import { IMAGE_COMPRESS_OPTIONS } from "@/constants/constants";

const EmojiPicker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

interface TagUsersProps {
  roles: RoleInfo[];
  id: any;
  display_name: any;
  avatar: any;
}

const DEFAULT_TITLE = `Bản tin ngày ${dayjs().format("DD/MM/YYYY")}`;

export default function CreateUpdatePostForm({
  fetchPostList,
  editedPost,
}: {
  fetchPostList: () => Promise<void>;
  editedPost?: PostInfo;
}) {
  const router = useRouter();
  const { theme } = useTheme();

  const createConfirmModal = useDisclosure();
  const updateConfirmModal = useDisclosure();

  const { loading, withLoading } = useLoading();

  const [tagUsers, setTagUsers] = useState<TagUsersProps[]>([]);

  const [title, setTitle] = useState(editedPost ? editedPost.title : DEFAULT_TITLE);
  const [content, setContent] = useState(editedPost ? editedPost.content : "");
  const [activeAt, setActiveAt] = useState<ZonedDateTime>(
    editedPost ? parseAbsoluteToLocal(editedPost.active_at) : now(getLocalTimeZone())
  );
  const [isHot, setIsHot] = useState<boolean>(Boolean(editedPost?.is_hot) || false);
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    editedPost?.image || undefined
  );
  const [images, setImages] = useState<ImageListType>([]);
  const [showEmoji, setShowEmoji] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTagUsers = () => {
      fetch("/api/posts/tag-users")
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            setTagUsers(result.data);
          }
        });
    };

    fetchTagUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    }

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  const handleAddEmoji = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
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
          data_url: base64,
          file: compressedFile,
        };
      })
    );

    setImages(parsedImageList);
  };

  const handleValidate = () => {
    const warning = (title: string, description?: string) => {
      addToast({
        title,
        description,
        color: "warning",
      });
    };

    if (!title) return warning("Vui lòng nhập tiêu đề cho bản tin!");
    else if (!content) return warning("Vui lòng nhập nội dung cho bản tin!");
    else if (content.length >= 6000)
      return warning(
        "Nội dung bản tin quá dài",
        "Nội dung chỉ nên chứa khoảng dưới 1000 từ. Vui lòng sử dụng câu từ chắt lọc, cô đọng!"
      );

    return true;
  };

  const handleCreateNewPost = async () => {
    withLoading(async () => {
      let image = "";

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
            return addToast({
              title: "Tải ảnh lên thất bại!",
              color: "danger",
            });
          });
      }

      const newPost: Partial<PostInfo> = {
        title,
        slug: CommonUtils.generateSlug(title),
        content,
        description: "",
        image: image,
        active_at: activeAt.toAbsoluteString(),
        is_hot: isHot,
      };

      await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log({ result });
          if (result.status === STATUS_CODE.CREATED) {
            addToast({
              title: "Đăng bản tin thành công",
              description: "Hệ thống sẽ tự động đăng bản tin lên Bảng tin HNB.",
              color: "success",
            });
            fetchPostList();
            router.push("/management/hub/news");
          } else {
            addToast({
              title: "Đăng bản tin lỗi",
              color: "danger",
            });
          }

          createConfirmModal.onClose();
        });
    });
  };

  const handleUpdatePost = async () => {
    if (!editedPost)
      return addToast({
        title: "Không tìm thấy bản tin!",
        color: "danger",
      });

    withLoading(async () => {
      let image = "";

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
            return addToast({
              title: "Tải ảnh lên thất bại!",
              description: error,
              color: "danger",
            });
          });
      }

      const updatedPost: Partial<PostInfo> = {
        id: editedPost.id,
        slug: editedPost.slug,
        title,
        content,
        image,
        active_at: activeAt.toAbsoluteString(),
        is_hot: isHot,
      };

      await fetch("/api/posts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPost),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.status === STATUS_CODE.OK) {
            addToast({
              title: "Cập nhật bản tin thành công",
              color: "success",
            });
            fetchPostList();
            router.push("/management/hub/news");
          } else {
            addToast({
              title: "Cập nhật bản tin lỗi",
              color: "danger",
            });
          }

          updateConfirmModal.onClose();
        });
    });
  };

  return (
    <div className="flex w-full flex-col gap-4 px-2">
      <div className="flex items-center justify-center gap-2">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
          startContent={<ArrowLeftIcon />}
        />
        <div className="flex-1 text-center">
          <p className="text-xl font-bold uppercase md:text-2xl">
            {editedPost ? "Cập nhật" : "Đăng"} bản tin
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

      <div className="w-full">
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
                  backgroundImage: `url(${imageList && !!imageList.length ? imageList?.[0]?.["data_url"] : currentImage})`,
                }}
              >
                <div
                  className={`text-center ${(!!imageList.length || (editedPost && currentImage)) && "hidden"}`}
                >
                  <p className="text-lg font-semibold">
                    Ảnh bìa bản tin <span className="text-sm opacity-75">(không bắt buộc)</span>
                  </p>
                  <span
                    className={`flex items-center gap-1 opacity-50 duration-200 ${isDragging && "opacity-100"}`}
                  >
                    {isDragging ? <HandIcon /> : <CursorIcon size={16} />}
                    {isDragging ? "Thả vào đây để tải ảnh lên" : "Nhấn hoặc kéo thả để tải ảnh lên"}
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
      </div>

      <div className="flex flex-col items-start justify-center gap-2">
        <MentionsInput
          value={content}
          onChange={(_, newValue) => setContent(newValue)}
          className="emoji-text min-h-[100px] w-full rounded-lg border"
          placeholder="Nhập nội dung bản tin..."
          style={mentionInputStyle}
          a11ySuggestionsListLabel={"Tag"}
        >
          <Mention
            trigger="@"
            data={tagUsers.map((user) => ({
              id: user.id,
              display: user.display_name,
              avatar: user.avatar,
            }))}
            renderSuggestion={(suggestion: any) => {
              return (
                <div className="flex items-center gap-2">
                  <Avatar src={suggestion.avatar} />
                  <span>{suggestion.display}</span>
                </div>
              );
            }}
            markup="@[__display__](id:__id__)"
            displayTransform={(id, display) => `@${display}`}
            style={{
              backgroundColor: "#196AC2",
            }}
          />
        </MentionsInput>

        <div className="relative ml-auto inline-block">
          <button
            onClick={() => setShowEmoji((prev) => !prev)}
            className="cursor-pointer rounded-md border p-2 duration-200 hover:scale-110"
          >
            😀 <p className="hidden text-sm md:inline">Biểu cảm</p>
          </button>

          {showEmoji && (
            <div ref={pickerRef} className="absolute top-4 right-full z-50 mb-2 -translate-y-1/2">
              <EmojiPicker
                width={300}
                theme={(theme as Theme) || Theme.LIGHT}
                onEmojiClick={handleAddEmoji}
                previewConfig={{
                  showPreview: false,
                }}
                skinTonesDisabled
                suggestedEmojisMode={SuggestionMode.FREQUENT}
                style={{
                  paddingRight: 8,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-4 sm:flex-row sm:items-center md:gap-16">
        <SwitchCard
          title="Tin HOT"
          description="Bản tin này sẽ được ưu tiên hiển thị trên bảng tin."
          checked={isHot}
          setChecked={setIsHot}
          switchProps={{
            color: "danger",
            thumbIcon: ({ isSelected }) =>
              isSelected ? (
                <Image src={FIRE_ICON.src} alt="fire" className="aspect-square w-8" />
              ) : null,
          }}
          switchClassName="flex items-center gap-2"
        />

        <div className="flex items-end gap-2">
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
            className="flex-1"
          />

          <Button
            variant="light"
            color="secondary"
            onPress={() => setActiveAt(now(getLocalTimeZone()))}
          >
            Chọn bây giờ
          </Button>
        </div>
      </div>

      <Button
        color="success"
        onPress={() => {
          const validated = handleValidate();
          if (validated) {
            if (editedPost) updateConfirmModal.onOpen();
            else createConfirmModal.onOpen();
          }
        }}
        startContent={!loading && <CheckIcon size={16} />}
        isLoading={loading}
      >
        Hoàn tất
      </Button>

      <ConfirmModal
        open={createConfirmModal.isOpen}
        onOpenChange={createConfirmModal.onOpenChange}
        onClose={createConfirmModal.onClose}
        onConfirm={handleCreateNewPost}
        title={"Xác nhận đăng bản tin"}
        description={"Đảm bảo rằng thông tin của bản tin hoàn toàn chính xác trước khi đăng!"}
        confirmText="Đăng bản tin"
        modalProps={{
          size: "lg",
          placement: "center",
        }}
        loading={loading}
      />

      <ConfirmModal
        open={updateConfirmModal.isOpen}
        onOpenChange={updateConfirmModal.onOpenChange}
        onClose={updateConfirmModal.onClose}
        onConfirm={handleUpdatePost}
        title={"Xác nhận cập nhật bản tin"}
        description={
          "Đảm bảo rằng thông tin của bản tin hoàn toàn chính xác trước khi hoàn tất cập nhật!"
        }
        confirmText="Cập nhật bản tin"
        modalProps={{
          size: "lg",
          placement: "center",
        }}
        loading={loading}
      />
    </div>
  );
}
