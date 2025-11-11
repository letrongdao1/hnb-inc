import { STATUS_CODE } from "@/constants/enums";
import { EventCost } from "@/interfaces/events";
import {
  addToast,
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
  User,
} from "@heroui/react";
import React, { useCallback, useEffect, useState } from "react";
import { CheckIcon, PlusIcon, ReloadIcon } from "../svg";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldErrorText } from "../ui/text";
import { useLoading } from "@/hooks/useLoading";
import { CommonUtils } from "@/utils/common.utils";
import TableLoader from "../loader/TableLoader";

type CreateEventCostFieldProps = yup.InferType<typeof schema>;

const schema = yup
  .object({
    type: yup
      .string()
      .max(50, `Chỉ chứa tối đa ${50} ký tự`)
      .required("Vui lòng nhập loại chi phí")
      .trim(),
    amount: yup
      .number()
      .min(10000, "Không chia tiền dưới 10,000")
      .max(100000000, `Lưu ý: Dơn vị tiền tệ là VND, không phải đơn vị tiền tệ của Zimbabwe`)
      .required("Vui lòng nhập giá tiền"),
    note: yup.string().max(200, "Chỉ chứa tối đa 200 ký tự"),
  })
  .required();

export default function EventCostList({ eventId }: { eventId: string }) {
  const addCostModal = useDisclosure();
  const { setLoading, loading } = useLoading();
  const addLoading = useLoading();

  const [eventCostList, setEventCostList] = useState<EventCost[]>([]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateEventCostFieldProps>({
    resolver: yupResolver(schema as any),
  });

  const watcher = {
    type: {
      length: watch("type")?.trim().length,
      isExceeded: watch("type")?.trim().length > 50,
    },
    amount: {
      value: watch("amount"),
    },
    note: {
      length: watch("note")?.trim().length,
    },
  };

  const fetchEventCostList = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    await fetch(`/api/events/costs?eventId=${eventId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          console.log({ data: result.data });
          setEventCostList(result.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [eventId, setLoading]);

  const columns = [
    {
      key: "user",
      label: "Người chi trả",
    },
    {
      key: "type",
      label: "Danh mục",
    },
    {
      key: "amount",
      label: "Số tiền",
    },
    {
      key: "created_at",
      label: "Thời gian",
    },
  ];

  const renderCell = React.useCallback((eventCost: EventCost, columnKey: keyof EventCost) => {
    switch (columnKey) {
      case "user":
        return (
          <User
            avatarProps={{ radius: "lg", src: eventCost.user.avatar }}
            name={eventCost.user.display_name}
          >
            {eventCost.user.display_name}
          </User>
        );
      case "type":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{eventCost.type}</p>
          </div>
        );
      case "amount":
        return (
          <Chip color={"success"} size="sm" variant="flat">
            {CommonUtils.formatMoneyVND(eventCost.amount)}
          </Chip>
        );
      case "created_at":
        return (
          <time dateTime={eventCost.created_at} className="ml-1">
            {new Date(eventCost.created_at).toLocaleDateString("vi", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        );
      default:
        return "-";
    }
  }, []);

  useEffect(() => {
    fetchEventCostList();
  }, [fetchEventCostList]);

  const handleCreateEventCost = async (values: any) => {
    const params = {
      ...values,
      event: eventId,
    };

    addLoading.setLoading(true);

    await fetch("/api/events/costs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.CREATED) {
          fetchEventCostList();
          addToast({ title: result.message, color: "success" });
          handleCloseAddModal();
        }
      })
      .catch((err) => addToast({ title: err, color: "danger" }))
      .finally(() => {
        addLoading.setLoading(false);
      });
  };

  const handleCloseAddModal = () => {
    addCostModal.onClose();
    reset();
  };

  if (loading) return <TableLoader />;

  return (
    <div>
      {Boolean(eventCostList.length) ? (
        <Table
          aria-label="Example table with custom cells"
          topContent={
            <div className="flex items-center justify-between gap-2">
              {eventCostList.length > 0 && (
                <p className="text-xs font-light">Tổng: {eventCostList.length}</p>
              )}

              <div className="ml-auto flex items-center gap-2">
                <Button
                  startContent={<ReloadIcon />}
                  color="secondary"
                  variant="flat"
                  onPress={() => {
                    fetchEventCostList();
                  }}
                  isIconOnly
                />
                <Button
                  startContent={<PlusIcon />}
                  color="success"
                  onPress={() => {
                    addCostModal.onOpen();
                  }}
                >
                  Tạo khoản chi phí
                </Button>
              </div>
            </div>
          }
          topContentPlacement="inside"
          isHeaderSticky
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} align={"center"}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={eventCostList}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey as any)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-2 py-8">
          <p className="text-sm font-light opacity-75">Chưa có khoản chi phí nào</p>

          <Button
            startContent={<PlusIcon />}
            color="success"
            onPress={() => {
              addCostModal.onOpen();
            }}
          >
            Tạo khoản chi phí
          </Button>
        </div>
      )}

      <Modal
        isOpen={addCostModal.isOpen}
        onOpenChange={addCostModal.onOpenChange}
        onClose={handleCloseAddModal}
        isDismissable={false}
      >
        <form onSubmit={handleSubmit(handleCreateEventCost)}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">Tạo khoản chi phí sự kiện</ModalHeader>
                <ModalBody>
                  <div className="space-y-0.5">
                    <Input
                      {...register("type", { required: true })}
                      label={"Loại chi phí"}
                      isRequired
                      isInvalid={!!errors.type}
                      validate={() => undefined}
                      endContent={
                        <p
                          className={`text-xs opacity-75 ${watcher.type.isExceeded && "text-red-500"}`}
                        >
                          {watcher.type.length}/{50}
                        </p>
                      }
                    />
                    <FieldErrorText>{errors.type?.message}</FieldErrorText>
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field }) => (
                        <Input
                          label={"Số tiền"}
                          value={field.value ? Number(field.value).toLocaleString("en-US") : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/,/g, "");
                            const cleaned = raw.replace(/\D/g, "");
                            field.onChange(cleaned);
                          }}
                          onBlur={() => {
                            if (field.value) field.onChange(Number(field.value));
                          }}
                          isRequired
                          isInvalid={!!errors.amount}
                          startContent={`₫`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />

                    <FieldErrorText>{errors.amount?.message}</FieldErrorText>
                  </div>

                  <div className="space-y-0.5">
                    <Textarea
                      {...register("note")}
                      label={"Ghi chú"}
                      placeholder="Note cho khoản chi phí..."
                      isInvalid={!!errors.note}
                      isClearable={Boolean(watcher.note.length)}
                      minRows={4}
                      maxRows={4}
                      spellCheck="false"
                    />
                    <FieldErrorText>{errors.note?.message}</FieldErrorText>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={handleCloseAddModal}>
                    Hủy
                  </Button>
                  <Button
                    color="success"
                    type="submit"
                    startContent={!addLoading.loading && <CheckIcon />}
                    isLoading={addLoading.loading}
                  >
                    Hoàn tất
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </form>
      </Modal>
    </div>
  );
}
