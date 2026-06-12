import { STATUS_CODE } from "@/constants/enums";
import { Event, EventCost, EventStatusEnum } from "@/interfaces/events";
import {
  Accordion,
  AccordionItem,
  addToast,
  Avatar,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon, DeleteIcon, PlusIcon, ReloadIcon } from "../svg";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FieldErrorText } from "../ui/text";
import { useLoading } from "@/hooks/useLoading";
import { CommonUtils } from "@/utils/common.utils";
import TableLoader from "../loader/TableLoader";
import ConfirmModal from "../ui/modal/ConfirmModal";
import { useUser } from "@/providers/user.provider";
import EmptyComponent from "../empty/empty";

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

export default function EventCostList({ event }: { event: Event }) {
  const { user } = useUser();
  const { setLoading, loading } = useLoading();
  const addCostModal = useDisclosure();
  const addLoading = useLoading();
  const deleteCostModal = useDisclosure();
  const deleteLoading = useLoading();

  const [eventCostList, setEventCostList] = useState<EventCost[]>([]);
  const [selectedCost, setSelectedCost] = useState<EventCost>();

  const eventCostByUser = useMemo(
    () =>
      eventCostList.reduce<Record<string, EventCost[]>>((acc, eventCost) => {
        if (!acc[eventCost.user.id]) {
          acc[eventCost.user.id] = [];
        }
        acc[eventCost.user.id].push(eventCost);
        return acc;
      }, {}),
    [eventCostList]
  );

  const totalCost = useMemo(
    () => eventCostList.reduce((prev, current) => (prev += current.amount), 0),
    [eventCostList]
  );

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
    if (!event) return;

    setLoading(true);
    await fetch(`/api/events/costs?eventId=${event.id}`)
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
  }, [event, setLoading]);

  const renderCell = useCallback(
    (eventCost: EventCost, columnKey: any) => {
      switch (columnKey) {
        case "action":
          return eventCost.user.id === user?.id ? (
            <Button
              isIconOnly
              variant="flat"
              color="danger"
              startContent={<DeleteIcon size={16} />}
              onPress={() => {
                setSelectedCost(eventCost);
                deleteCostModal.onOpen();
              }}
            />
          ) : (
            <></>
          );
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
            <Chip color={"success"} size="sm" variant="light">
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
    },
    [deleteCostModal, user]
  );

  useEffect(() => {
    fetchEventCostList();
  }, [fetchEventCostList]);

  const handleCreateEventCost = async (values: any) => {
    const params = {
      ...values,
      event: event.id,
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

  const handleDeleteEventCost = async () => {
    if (!selectedCost) return;

    const costId = selectedCost.id;

    deleteLoading.setLoading(true);

    await fetch("/api/events/costs", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ costId }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          setEventCostList((prev) => prev.filter((cost) => cost.id !== costId));
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        deleteLoading.setLoading(false);
        deleteCostModal.onClose();
      });
  };

  if (loading) return <TableLoader />;

  return (
    <div>
      {event.is_cost_split ? (
        <div className="flex flex-col">
          {!eventCostList.length ? (
            <EmptyComponent title="Chưa có chi phí" />
          ) : (
            <Accordion selectionMode="multiple" variant="light">
              {Object.entries(eventCostByUser).map(([userId, costList]) => {
                const costUser = costList[0]?.user;
                const personalTotal = costList.reduce(
                  (acc, eventCost) => (acc += eventCost.amount),
                  0
                );
                return (
                  <AccordionItem
                    key={userId}
                    title={
                      <div className="flex w-full items-center justify-between text-sm md:text-base">
                        <p className="line-clamp-1 font-semibold">{costUser.display_name}</p>
                        <p className="text-success-400 shrink-0 font-semibold md:text-lg">
                          {CommonUtils.formatMoneyVND(personalTotal)}
                        </p>
                      </div>
                    }
                    startContent={
                      <Avatar src={costUser.avatar} alt="" className="scale-75 md:scale-100" />
                    }
                  >
                    <div className="flex w-full flex-col items-stretch gap-2">
                      {costList.map((cost, index) => (
                        <div
                          key={cost.id}
                          className={`flex w-full items-center justify-between gap-2 py-1 md:gap-8 ${index < costList.length - 1 && "border-default-300 border-b"}`}
                        >
                          <div className="flex-1 space-y-1">
                            <span>
                              <p className="text-sm font-semibold">{cost.type}</p>
                            </span>
                            <p className="text-xs font-light">{cost.note}</p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <p className="font-semibold">
                              {CommonUtils.formatMoneyVND(cost.amount)}
                            </p>

                            {cost.user.id === user?.id && (
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                startContent={<DeleteIcon size={16} />}
                                onPress={() => {
                                  setSelectedCost(cost);
                                  deleteCostModal.onOpen();
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      ) : (
        <></>
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
                            const cleaned = raw.replace(/\D/g, "") || "0";
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

      <ConfirmModal
        open={deleteCostModal.isOpen}
        onOpenChange={deleteCostModal.onOpenChange}
        onClose={deleteCostModal.onClose}
        title="Xác nhận xóa chi phí"
        extra={<span className="text-red-500">Thao tác này không thể hoàn tác</span>}
        onConfirm={handleDeleteEventCost}
        confirmText="Xác nhận"
        okButtonProps={{
          startContent: !deleteLoading.loading && <DeleteIcon size={16} />,
          color: "danger",
          isLoading: deleteLoading.loading,
        }}
      />
    </div>
  );
}
