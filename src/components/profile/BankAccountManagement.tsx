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
} from "@heroui/react";
import { ArrowLeftIcon, CheckIcon, DeleteIcon, PlusIcon } from "../svg";
import { Bank, BankAccount } from "@/interfaces/common";
import { useLoading } from "@/hooks/useLoading";
import { createNewBankAccount, deleteBankAccount, getUserBankAccounts } from "@/app/profile/page";
import Loader from "../loader";
import { STATUS_CODE } from "@/constants/enums";
import EmptyComponent from "../empty/empty";
import ConfirmModal from "../modal/ConfirmModal";

interface PersonalInfoProps {
  user: UserInfo | null;
}

export default function BankAccountManagement({ user }: PersonalInfoProps) {
  const { loading, setLoading } = useLoading();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [accountList, setAccountList] = useState<BankAccount[]>([]);
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState<boolean>(false);
  const [deletedAccount, setDeletedAccount] = useState<string>();

  const fetchUserBankAccount = useCallback(async () => {
    setLoading(true);

    await getUserBankAccounts()
      .then((response) => {
        if (response.data) setAccountList(response.data);
      })
      .finally(() => setLoading(false));
  }, [setLoading]);

  const fetchBankList = useCallback(async () => {
    setLoading(true);
    await fetch("/api/profile/banks")
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        console.log({ banks: data.data });

        setBankList(data.data as Bank[]);
      })
      .finally(() => setLoading(false));
  }, [setLoading]);

  useEffect(() => {
    fetchUserBankAccount();
  }, [fetchUserBankAccount]);

  const handleDeleteAccount = async () => {
    if (!deletedAccount) return;
    setLoading(true);

    await deleteBankAccount(deletedAccount)
      .then((res) => {
        if (res.status === STATUS_CODE.OK) {
          addToast({
            title: res.message,
            color: "success",
          });
          fetchUserBankAccount();
        } else {
          addToast({
            title: res.message,
            color: "danger",
          });
        }
      })
      .finally(() => {
        setLoading(false);
        onClose();
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
          setLoading={setLoading}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 md:px-4">
            <h3 className="text-lg font-bold md:text-3xl">Danh sách tài khoản</h3>
            <Button
              onPress={async () => {
                setIsAddingAccount(true);
                await fetchBankList();
              }}
              color="success"
              startContent={<PlusIcon size={16} />}
            >
              <p className="hidden lg:inline">Thêm tài khoản</p>
            </Button>
          </div>

          {loading ? (
            <Loader margin={10} />
          ) : accountList.length === 0 ? (
            <EmptyComponent title="Chưa có tài khoản" margin={2} />
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-2">
              {accountList.map((account) => (
                <div key={account.id} className="flex items-stretch gap-2 rounded-md p-2">
                  <Image
                    src={account.bank_logo}
                    alt={account.bank_short_name}
                    className="aspect-square w-16 rounded-full border bg-white object-contain"
                  />
                  <div className="space-y-0">
                    <p className="line-clamp-1 text-xs font-light opacity-60">
                      {account.bank_name}
                    </p>
                    <p className="text-lg font-semibold uppercase">{account.account_owner}</p>
                    <p className="text-sm font-semibold opacity-75">{account.account_number}</p>
                  </div>

                  <Button
                    isIconOnly
                    startContent={<DeleteIcon size={16} />}
                    isLoading={loading}
                    variant="faded"
                    color="danger"
                    onPress={() => {
                      setDeletedAccount(account.id);
                      onOpen();
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <ConfirmModal
            open={isOpen}
            onOpenChange={onOpenChange}
            onClose={onClose}
            title="Xóa tài khoản ngân hàng"
            extra="Thao tác này không thể được hoàn tác"
            onConfirm={handleDeleteAccount}
            okButtonProps={{
              color: "danger",
            }}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

const AddAccount = ({
  bankList,
  setIsAddingAccount,
  fetchUserBankAccount,
  loading,
  setLoading,
}: {
  bankList: Bank[];
  setIsAddingAccount: React.Dispatch<React.SetStateAction<boolean>>;
  fetchUserBankAccount: () => Promise<void>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateBankAccount = async (e: any) => {
    e.preventDefault();
    setIsCreating(true);
    const data: any = Object.fromEntries(new FormData(e.currentTarget));

    const bank = bankList.find((b) => b.shortName === data.bank);
    if (!bank) return;

    const newAccount: Partial<BankAccount> = {
      account_number: data.account_number,
      account_owner: data.account_owner,
      bank_code: bank.code,
      bank_name: bank.name,
      bank_logo: bank.logo,
      bank_short_name: bank.shortName,
    };

    await createNewBankAccount(newAccount)
      .then((res) => {
        if (res.status === STATUS_CODE.CREATED) {
          addToast({
            title: res.message,
            color: "success",
          });
          setIsAddingAccount(false);
          fetchUserBankAccount();
        } else {
          addToast({
            title: res.message,
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
          onSubmit={handleCreateBankAccount}
          className="flex flex-col items-stretch gap-4 md:px-16"
        >
          <Autocomplete
            isRequired
            name="bank"
            label="Ngân hàng"
            placeholder="Chọn ngân hàng"
            size="lg"
          >
            {bankList.map((bank) => (
              <AutocompleteItem
                key={bank.id}
                textValue={bank.shortName}
                startContent={
                  <Image
                    src={bank.logo}
                    alt={bank.shortName}
                    className="aspect-square max-w-8 min-w-8 rounded-full border bg-white object-contain"
                  />
                }
                title={bank.name}
                showDivider
              />
            ))}
          </Autocomplete>

          <Input name="account_number" label="Số tài khoản" isRequired />

          <Input name="account_owner" label="Tên chủ sở hữu" isRequired />

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
