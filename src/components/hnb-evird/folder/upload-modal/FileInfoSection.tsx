"use client";

import React, { useMemo, useRef, useState } from "react";
import { CLOUD_UPLOAD_FOLDER_TYPE } from "@/constants/b2_folder";
import { UploadFile } from "@/interfaces/common";
import {
  addToast,
  Button,
  Form,
  Input,
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

dayjs.extend(customParseFormat);

type FileInfoSectionProps = {
  handleUpload: (props: UploadProps) => Promise<void>;
  uploadFileList: File[];
  uploadProgress: number;
};

const keepRawFolderTypeList = ["MEME"];
const hideDescriptionFolderTypeList = ["GRADUATION"];

export default function FileInfoSection({
  handleUpload,
  uploadFileList,
  uploadProgress,
}: FileInfoSectionProps) {
  const [selectedFolderType, setSelectedFolderType] = useState<string>();
  const [currentFolderTime, setCurrentFolderTime] = useState<Date | null>(new Date(Date.now()));
  const [validatedInfo, setValidatedInfo] = useState<UploadProps>();

  const confirmModal = useDisclosure();

  const totalUploadSize = useMemo(
    () => uploadFileList.reduce((prev, file) => prev + file.size, 0),
    [uploadFileList]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      title: String(data.title || ""),
      folderName: folderName,
      folderPath: finalFolderPath,
      description: String(data.description || ""),
    });

    confirmModal.onOpen();
  };

  const renderExtraInfoFields = () => {
    if (!selectedFolderType) return null;

    switch (selectedFolderType.toUpperCase()) {
      case "MEME": {
        return (
          <>
            <Input label="Tên meme" name="title" placeholder="Nhập tên meme ..." isRequired />
          </>
        );
      }
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
              label="Tên thư mục"
              name="title"
              placeholder="..."
              isRequired
              minRows={1}
              maxRows={3}
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
              }}
              className="w-full"
            />
          </>
        );
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col items-stretch justify-start gap-2">
      {!Boolean(selectedFolderType) && (
        <p className="text-warning-500 text-sm italic">Vui lòng chọn thư mục lưu</p>
      )}
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

          {!hideDescriptionFolderTypeList.some((type) => type === selectedFolderType) && (
            <Textarea
              label="Mô tả"
              name="description"
              placeholder="Nhập mô tả nội dung..."
              description={"*Không bắt buộc"}
            />
          )}

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
