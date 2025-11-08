"use client";

import { UserInfo } from "@/interfaces/user";
import React, { useCallback, useEffect, useState } from "react";
import {
  Input,
  Button,
  addToast,
  Image,
  Autocomplete,
  AutocompleteItem,
  useDisclosure,
  Chip,
  Spinner,
} from "@heroui/react";
import { ArrowLeftIcon, CheckIcon, DeleteIcon, PlusIcon } from "../svg";
import { Bank, BankAccount } from "@/interfaces/common";
import { useLoading } from "@/hooks/useLoading";
import Loader from "../loader";
import { STATUS_CODE } from "@/constants/enums";
import EmptyComponent from "../empty/empty";
import ConfirmModal from "../ui/modal/ConfirmModal";
import { CommonUtils } from "@/utils/common.utils";
import { MAX_BANK_ACCOUNT_CAPACITY } from "@/constants/constants";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { FieldErrorText } from "../ui/text/text";

interface PersonalInfoProps {
  user: UserInfo | null;
}

export default function BankAccountManagement({ user }: PersonalInfoProps) {
  const { loading, setLoading } = useLoading();

  const {
    isOpen: isOpenUpdateSelect,
    onOpen: onOpenUpdateSelect,
    onOpenChange: onOpenChangeUpdateSelect,
    onClose: onCloseUpdateSelect,
  } = useDisclosure();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const [accountList, setAccountList] = useState<BankAccount[]>([]);
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchUserBankAccount = useCallback(async () => {
    setLoading(true);

    await fetch("api/profile/accounts/user")
      .then((res) => res.json())
      .then((result) => {
        if (result.data) setAccountList(result.data);
      })
      .finally(() => setLoading(false));
  }, [setLoading]);

  const fetchBankList = useCallback(async () => {
    setLoading(true);
    await fetch("/api/profile/banks")
      .then((res) => res.json())
      .then((result) => {
        if (!result) return;

        setBankList(result.data as Bank[]);
      })
      .finally(() => setLoading(false));
  }, [setLoading]);

  useEffect(() => {
    fetchUserBankAccount();
  }, [fetchUserBankAccount]);

  const handleSelectBankAccount = async () => {
    if (!selectedAccount) return;
    setIsUpdating(true);

    await fetch("/api/profile/accounts/user/select", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: selectedAccount }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          addToast({
            title: result.message,
            color: "success",
          });
          fetchUserBankAccount();
        } else {
          addToast({
            title: result.message,
            color: "danger",
          });
        }
      })
      .finally(() => {
        setIsUpdating(false);
        onCloseUpdateSelect();
      });
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    setIsUpdating(true);

    await fetch("/api/profile/accounts/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: selectedAccount }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.OK) {
          fetchUserBankAccount();
        } else {
          addToast({
            title: result.message,
            color: "danger",
          });
        }
      })
      .finally(() => {
        setIsUpdating(false);
        onCloseDelete();
      });
  };

  return (
    <div className="flex w-full flex-col items-stretch gap-4 px-2 md:px-4">
      {isAddingAccount ? (
        <AddAccount
          bankList={bankList}
          setIsAddingAccount={setIsAddingAccount}
          fetchUserBankAccount={fetchUserBankAccount}
          loading={loading}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 md:px-4">
            <h3 className="text-lg font-bold md:text-3xl">Danh sách tài khoản</h3>
            {loading ? (
              <Spinner size="sm" color="default" />
            ) : accountList.length < MAX_BANK_ACCOUNT_CAPACITY ? (
              <Button
                onPress={async () => {
                  setIsAddingAccount(true);
                  await fetchBankList();
                }}
                color="success"
                variant="light"
                startContent={<PlusIcon size={16} />}
              >
                <p className="hidden lg:inline">Thêm tài khoản</p>
              </Button>
            ) : (
              <p className="text-sm opacity-50">Đã đạt tối đa</p>
            )}
          </div>

          {loading ? (
            <Loader margin={10} />
          ) : accountList.length === 0 ? (
            <EmptyComponent
              title="Chưa có tài khoản"
              description={
                <Button
                  onPress={async () => {
                    setIsAddingAccount(true);
                    await fetchBankList();
                  }}
                  color="success"
                  startContent={<PlusIcon size={16} />}
                >
                  <p className="hidden not-italic lg:inline">Thêm tài khoản</p>
                </Button>
              }
              margin={2}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-2">
                {accountList.map((account) => (
                  <div key={account.id} className="flex w-full items-stretch gap-2 rounded-md p-2">
                    <Image
                      src={account.bank_logo}
                      alt={account.bank_short_name}
                      className="aspect-square w-16 rounded-full border bg-white object-contain"
                    />
                    <div className="flex-1 space-y-0">
                      <p className="line-clamp-1 text-xs font-light opacity-60">
                        {account.bank_name}
                      </p>
                      <p className="text-lg font-semibold uppercase">{account.account_owner}</p>
                      <p className="text-sm font-semibold opacity-75">
                        {CommonUtils.getHiddenNumber(account.account_number)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2">
                      <Button
                        isIconOnly
                        startContent={<DeleteIcon size={16} />}
                        isLoading={loading}
                        variant="faded"
                        color="danger"
                        size="sm"
                        onPress={() => {
                          setSelectedAccount(account.id);
                          onOpenDelete();
                        }}
                      />

                      {account.is_selected ? (
                        <Chip
                          color="success"
                          startContent={<CheckIcon size={18} />}
                          variant="shadow"
                        >
                          Đang sử dụng
                        </Chip>
                      ) : (
                        <Chip
                          onClick={() => {
                            setSelectedAccount(account.id);
                            onOpenUpdateSelect();
                          }}
                          className="cursor-pointer duration-200 hover:brightness-75"
                        >
                          Chọn
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {!!accountList.length && (
                <p className="text-end text-sm opacity-50">
                  Tổng số tài khoản hiện tại: {accountList.length} / {MAX_BANK_ACCOUNT_CAPACITY}
                </p>
              )}
            </>
          )}

          <ConfirmModal
            open={isOpenUpdateSelect}
            onOpenChange={onOpenChangeUpdateSelect}
            onClose={onCloseUpdateSelect}
            title="Xác nhận thay đổi tài khoản sử dụng"
            description="Tài khoản này sẽ được chọn dể sử dụng cho mục đích giao dịch trên hệ thống của bạn."
            onConfirm={handleSelectBankAccount}
            okButtonProps={{
              color: "success",
            }}
            loading={isUpdating}
          />

          <ConfirmModal
            open={isOpenDelete}
            onOpenChange={onOpenChangeDelete}
            onClose={onCloseDelete}
            title="Xóa tài khoản ngân hàng"
            extra="Thao tác này không thể được hoàn tác"
            onConfirm={handleDeleteAccount}
            okButtonProps={{
              color: "danger",
            }}
            loading={isUpdating}
          />
        </>
      )}
    </div>
  );
}

/* ----------------------------- CREATE BANK ACCOUNT ----------------------------- */

type CreateBankAccountFieldProps = yup.InferType<typeof schema>;

const schema = yup
  .object({
    account_number: yup
      .string()
      .matches(/^\d+$/, "Vui lòng chỉ nhập ký tự số!")
      .min(6, `Số tài khoản chứa tối thiểu 6 số`)
      .max(19, `Số tài khoản chứa tối đa 19 số`)
      .required("Vui lòng nhập số tài khoản")
      .trim(),
    account_owner: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Vui lòng nhập tiếng Việt không dấu, không chứa ký tự đặc biệt!")
      .min(5, `Tên tài khoản chứa tối thiểu 5 ký tự`)
      .max(50, `Tên tài khoản chứa tối thiểu 50 ký tự`)
      .required("Vui lòng nhập tên tài khoản")
      .trim()
      .transform((value) => (value ? value.toUpperCase() : value)),
  })
  .required();

const AddAccount = ({
  bankList,
  setIsAddingAccount,
  fetchUserBankAccount,
  loading,
}: {
  bankList: Bank[];
  setIsAddingAccount: React.Dispatch<React.SetStateAction<boolean>>;
  fetchUserBankAccount: () => Promise<void>;
  loading: boolean;
}) => {
  const [selectedBank, setSelectedBank] = useState<React.Key | null>();
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateBankAccountFieldProps>({ resolver: yupResolver(schema as any) });

  const watcher = {
    account_number: {
      length: watch("account_number")?.trim().length,
      isExceeded: watch("account_number")?.trim().length > 19,
    },
    account_owner: {
      length: watch("account_owner")?.trim().length,
      isExceeded: watch("account_owner")?.trim().length > 50,
    },
  };

  const handleCreateBankAccount = async (data: CreateBankAccountFieldProps) => {
    setIsCreating(true);

    const bank = bankList.find((b) => b.id.toString() === selectedBank?.toString());
    if (!bank) return;

    const newAccount: Partial<BankAccount> = {
      account_number: data.account_number,
      account_owner: data.account_owner,
      bank_id: bank.bin,
      bank_code: bank.code,
      bank_name: bank.name,
      bank_logo: bank.logo,
      bank_short_name: bank.shortName,
    };

    await fetch("/api/profile/accounts/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAccount),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === STATUS_CODE.CREATED) {
          addToast({
            title: result.message,
            color: "success",
          });
          setIsAddingAccount(false);
          fetchUserBankAccount();
        } else {
          addToast({
            title: result.message,
            color: "danger",
          });
        }
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  return (
    <>
      <div className="flex items-center justify-start gap-4">
        <Button
          isIconOnly
          variant="flat"
          startContent={<ArrowLeftIcon />}
          onPress={() => setIsAddingAccount(false)}
        />
        <h3 className="text-lg font-bold md:text-3xl">Thêm tài khoản</h3>
      </div>

      {loading ? (
        <Loader margin={10} />
      ) : (
        <form
          onSubmit={handleSubmit(handleCreateBankAccount)}
          className="flex flex-col items-stretch gap-4 md:px-16"
        >
          <Autocomplete
            isRequired
            name="bank"
            label="Ngân hàng"
            placeholder="Chọn ngân hàng"
            size="lg"
            onSelectionChange={(value) => {
              setSelectedBank(value);
            }}
            listboxProps={{
              itemClasses: {
                base: [
                  "rounded-medium",
                  "text-default-500",
                  "transition-opacity",
                  "data-[hover=true]:text-foreground",
                  "dark:data-[hover=true]:bg-default-50",
                  "data-[pressed=true]:opacity-70",
                  "data-[hover=true]:bg-default-200",
                  "data-[selectable=true]:focus:bg-default-100",
                  "data-[focus-visible=true]:ring-default-500",
                ],
              },
            }}
            popoverProps={{
              offset: 10,
              classNames: {
                base: "rounded-large",
                content: "p-1 space-y-2 border-small border-default-100 bg-background",
              },
            }}
          >
            {bankList.map((bank) => (
              <AutocompleteItem
                key={bank.id}
                textValue={bank.shortName + " - " + bank.name}
                startContent={
                  <Image
                    src={bank.logo}
                    alt={bank.shortName}
                    className="aspect-square max-w-8 min-w-8 rounded-full border bg-white object-contain"
                  />
                }
                title={
                  <p className="line-clamp-1 font-semibold">
                    {bank.shortName}
                    <span className="ml-2 text-xs font-light">{bank.name}</span>
                  </p>
                }
                showDivider
              />
            ))}
          </Autocomplete>

          <div className="space-y-0.5">
            <Input
              {...register("account_number", { required: true })}
              label={"Số tài khoản"}
              isRequired
              isInvalid={!!errors.account_number}
              endContent={
                <p
                  className={`text-xs opacity-75 ${watcher.account_number.isExceeded && "text-red-500"}`}
                >
                  {watcher.account_number.length}/19
                </p>
              }
            />
            <FieldErrorText>{errors.account_number?.message}</FieldErrorText>
          </div>

          <div className="space-y-0.5">
            <Input
              {...register("account_owner", { required: true })}
              label={"Tên tài khoản"}
              isRequired
              isInvalid={!!errors.account_owner}
              endContent={
                <p
                  className={`text-xs opacity-75 ${watcher.account_owner.isExceeded && "text-red-500"}`}
                >
                  {watcher.account_owner.length}/50
                </p>
              }
            />
            <FieldErrorText>{errors.account_owner?.message}</FieldErrorText>
          </div>

          <Button
            isLoading={isCreating}
            type="submit"
            color="success"
            startContent={!isCreating && <CheckIcon />}
          >
            Hoàn tất
          </Button>
        </form>
      )}
    </>
  );
};
