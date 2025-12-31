"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CLOUD_UPLOAD_FOLDER_TYPE } from "@/constants/b2_folder";
import {
  addToast,
  Button,
  Form,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { CheckIcon } from "@/components/svg";
import CustomDatepicker from "@/components/ui/datepicker/CustomDatepicker";
import { FileUtils } from "@/utils/file.utils";
import { UploadProps } from ".";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { UPLOAD_REQUIRED_SECOND_PER_MB } from "@/constants/constants";
import { FolderNode } from "@/lib/s3/folders";
import FolderTreeSelect, { FolderTreeSkeleton } from "./FolderTreeSelect";
import { useParams } from "next/navigation";

dayjs.extend(customParseFormat);

type FileInfoSectionProps = {
  handleUpload: (props: UploadProps) => Promise<void>;
  uploadFileList: File[];
  uploadProgress: number;
};

const keepRawFolderTypeList = ["MEME"];

export default function FileInfoSection({
  handleUpload,
  uploadFileList,
  uploadProgress,
}: FileInfoSectionProps) {
  const { path } = useParams();

  const [isUploadToExistedFolder, setIsUploadToExistedFolder] = useState<boolean>(true);
  const [currentFolderList, setCurrentFolderList] = useState<FolderNode[]>([]);
  const [selectedFolderType, setSelectedFolderType] = useState<string>();
  const [currentFolderTime, setCurrentFolderTime] = useState<Date | null>(null);
  const [validatedInfo, setValidatedInfo] = useState<UploadProps>();

  const [isLoadingFolder, setIsLoadingFolder] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const confirmModal = useDisclosure();

  const totalUploadSize = useMemo(
    () => uploadFileList.reduce((prev, file) => prev + file.size, 0),
    [uploadFileList]
  );

  const fetchFolders = useCallback(async () => {
    setIsLoadingFolder(true);
    await fetch(`/api/b2/folders/all`)
      .then((res) => res.json())
      .then((result) => {
        setCurrentFolderList(result.data);
      })
      .finally(() => {
        setIsLoadingFolder(false);
      });
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    setSelectedFolderType(undefined);

    if (!path || !path.length) {
      setSelectedFolder("");
    } else {
      if (Array.isArray(path)) {
        setSelectedFolder(path.join("/"));
        toggleOpenMap(path);
      }
    }
  }, [path, isUploadToExistedFolder]);

  const handleUploadToExistedFolder = () => {
    if (!uploadFileList.length) {
      addToast({ title: "Vui lòng tải lên ít nhất 1 file", color: "warning" });
      return;
    }

    setValidatedInfo({
      folderName: FileUtils.getCurrentFolderNameByRelativePath(selectedFolder),
      folderPath: selectedFolder,
    });

    confirmModal.onOpen();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uploadFileList.length) {
      addToast({ title: "Vui lòng tải lên ít nhất 1 file", color: "warning" });
      return;
    }

    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (!selectedFolderType) {
      addToast({ title: "Vui lòng chọn thư mục lưu!", color: "warning" });
      return;
    }

    const rawFolderPath = CLOUD_UPLOAD_FOLDER_TYPE[selectedFolderType].folderPath;

    const folderName = FileUtils.formatFolderName(
      dayjs(currentFolderTime).isValid() ? dayjs(currentFolderTime).format("DD/MM/YYYY") : "",
      String(data.title || "")
    );

    const finalFolderPath = keepRawFolderTypeList.some((type) => type === selectedFolderType)
      ? rawFolderPath
      : [rawFolderPath, folderName].filter(Boolean).join("/");

    if (
      CLOUD_UPLOAD_FOLDER_TYPE[selectedFolderType].isRequireSubfolder &&
      finalFolderPath === rawFolderPath
    ) {
      addToast({
        title: "Lỗi tạo tên subfolder. Vui lòng liên hệ phòng IT để khắc phục!",
        color: "danger",
      });
      return;
    }

    setValidatedInfo({
      folderName: folderName,
      folderPath: finalFolderPath,
    });

    confirmModal.onOpen();
  };

  const toggleOpenMap = (path: string | string[]) => {
    if (Array.isArray(path)) {
      setOpenMap((prev) => {
        const next = { ...prev };

        path.forEach((p) => {
          next[p] = true;
        });

        return next;
      });
    } else setOpenMap((p) => ({ ...p, [path]: !p[path] }));
  };

  const renderExtraInfoFields = () => {
    if (!selectedFolderType) return null;

    switch (selectedFolderType.toUpperCase()) {
      // case "MEME": {
      //   return (
      //     <>
      //       <Input label="Tên meme" name="title" placeholder="Nhập tên meme ..." isRequired />
      //     </>
      //   );
      // }
      case "GRADUATION": {
        return (
          <Textarea
            label="Nhập tên đầy đủ"
            name="title"
            placeholder="Nguyễn Văn A, nguyen van a"
            description="Tên KHÔNG bắt buộc có dấu hay viết hoa"
            isRequired
            minRows={1}
            maxRows={3}
            errorMessage={"Vui lòng nhập tên đầy đủ."}
          />
        );
      }
      case "TEAM_BUILDING": {
        return (
          <>
            <Textarea
              label="Tên chuyến team building"
              name="title"
              placeholder="VD: Phan Thiết, Đà Lạt, Chuyến du đấu Lào ..."
              isRequired
              minRows={1}
              maxRows={3}
              errorMessage={"Vui lòng nhập tên chuyến đi."}
            />

            <CustomDatepicker
              selected={currentFolderTime}
              onChange={setCurrentFolderTime}
              showMonthYearPicker
              maxDate={new Date()}
              dateFormat="MM/yyyy"
              inputProps={{
                label: "Thời điểm",
                isRequired: true,
                errorMessage: "Vui lòng chọn thời điểm diễn ra.",
              }}
              className="w-full"
            />
          </>
        );
      }
      case "HNB_MEETING": {
        return (
          <>
            <Textarea
              label="Tên cuộc họp"
              name="title"
              placeholder="VD: Họp ở Hội sở, Gặp công ty *** ..."
              isRequired
              minRows={1}
              maxRows={3}
              errorMessage={"Vui lòng nhập tên cuộc họp."}
            />

            <CustomDatepicker
              selected={currentFolderTime}
              onChange={setCurrentFolderTime}
              showMonthDropdown
              useShortMonthInDropdown
              showYearDropdown
              dropdownMode="select"
              dateFormat="dd/MM/yyyy"
              minDate={new Date("2018-01-01")}
              maxDate={new Date()}
              inputProps={{
                label: "Ngày",
                isRequired: true,
                errorMessage: "Vui lòng chọn thời điểm diễn ra.",
              }}
              className="w-full"
            />
          </>
        );
      }
      case "OTHER": {
        return (
          <>
            <Textarea
              label="Tên sự kiện"
              name="title"
              placeholder="..."
              isRequired
              minRows={1}
              maxRows={3}
              errorMessage={"Vui lòng nhập tên sự kiện."}
            />

            <CustomDatepicker
              selected={currentFolderTime}
              onChange={setCurrentFolderTime}
              showMonthDropdown
              useShortMonthInDropdown
              showYearDropdown
              dropdownMode="select"
              dateFormat="dd/MM/yyyy"
              minDate={new Date("2018-01-01")}
              maxDate={new Date()}
              inputProps={{
                label: "Ngày",
                isRequired: true,
                errorMessage: "Vui lòng chọn thời điểm diễn ra.",
              }}
              className="w-full"
            />
          </>
        );
      }
    }
  };

  return (
    <div className="flex min-h-64 flex-1 flex-col items-stretch justify-start gap-2">
      <RadioGroup
        orientation="horizontal"
        color="success"
        defaultValue={isUploadToExistedFolder ? "1" : "0"}
        onChange={(e) => {
          setIsUploadToExistedFolder(e.target.value === "1");
        }}
        className="pb-2"
      >
        <Radio value="1">Thư mục có sẵn</Radio>
        <Radio value="0">Tạo thư mục mới</Radio>
      </RadioGroup>

      <p
        className={`text-warning-500 text-sm italic ${!selectedFolder && !selectedFolderType ? "visible" : "invisible"}`}
      >
        Vui lòng chọn thư mục lưu
      </p>

      {isUploadToExistedFolder ? (
        <>
          {isLoadingFolder ? (
            <FolderTreeSkeleton />
          ) : (
            <>
              <FolderTreeSelect
                folderTree={currentFolderList}
                selectedFolder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
                openMap={openMap}
                toggleOpenMap={toggleOpenMap}
              />

              <span className="flex-1" />

              <span className={`text-xs ${selectedFolder ? "visible" : "invisible"}`}>
                Thư mục lưu:&emsp;
                <span className="text-success-500 text-sm font-semibold">{selectedFolder}</span>
              </span>
              <Button
                isDisabled={!selectedFolder}
                color={"success"}
                fullWidth
                startContent={<CheckIcon size={16} />}
                onPress={handleUploadToExistedFolder}
                className="shrink-0"
              >
                Hoàn tất
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Select
            classNames={{
              trigger: "h-12",
            }}
            items={Object.entries(CLOUD_UPLOAD_FOLDER_TYPE).map(([key, obj]) => ({
              key,
              ...obj,
            }))}
            label="Thư mục lưu"
            labelPlacement="inside"
            value={selectedFolderType}
            onChange={(e) => {
              const folderType = e.target.value;

              setSelectedFolderType(folderType);
            }}
            placeholder="Chọn thư mục lưu"
            isRequired
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="text-small">{item.data?.label}</span>
                </div>
              ));
            }}
          >
            {(type) => (
              <SelectItem key={type.key} textValue={type.folderPath}>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-small">{type.label}</span>
                    <span className="text-tiny text-default-400">{type.description}</span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>

          {Boolean(selectedFolderType) && (
            <Form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="flex w-full flex-1 flex-col items-stretch"
            >
              {renderExtraInfoFields()}

              <span className="flex-1" />

              <Button
                type="submit"
                color={"success"}
                fullWidth
                startContent={<CheckIcon size={16} />}
                hidden={uploadProgress > 0}
                className="shrink-0"
              >
                Hoàn tất
              </Button>
            </Form>
          )}
        </>
      )}

      <ConfirmModal
        title={"Xác nhận upload file"}
        open={confirmModal.isOpen}
        onOpenChange={confirmModal.onOpenChange}
        onClose={() => {
          setValidatedInfo(undefined);
          confirmModal.onClose();
        }}
        onConfirm={() => {
          if (!validatedInfo) {
            addToast({ title: "Thông tin upload không hợp lệ", color: "danger" });
            return;
          }
          handleUpload(validatedInfo);
        }}
        description={`Tổng: ${uploadFileList.length} file (${FileUtils.formatFileSize(totalUploadSize)})`}
        extra={`Thời gian upload dự kiến: ~ ${Math.ceil(
          ((uploadFileList.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)) *
            UPLOAD_REQUIRED_SECOND_PER_MB) /
            60
        )} phút`}
      />
    </div>
  );
}
