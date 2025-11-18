import { ButtonProps } from "@heroui/react";
import { BaseUserInfo } from "./user";
import { NOTIFICATION_TYPE } from "@/constants/enums";

export interface PaginationProps {
  pageIndex: number;
  pageSize: number;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  short_name: string;
  logo: string;
  swift_code: string;
  support: number;
  isTransfer: number;
  transferSupported: number;
  lookupSupported: number;
}

export interface BankAccount {
  id: string;
  user?: string;
  account_number: string;
  account_owner: string;
  bank_id: string;
  bank_code: string;
  bank_name: string;
  bank_short_name: string;
  bank_logo: string;
  is_selected: boolean;
  created_at?: string;
}

export interface Notification {
  id: string;
  from_user?: string | null;
  user: string;
  title: string;
  description: string;
  type: NOTIFICATION_TYPE;
  href?: string;
  is_read: boolean;
  ref_id?: string | null;
  created_at: string;
}

export interface UserStreak {
  user: BaseUserInfo;
  current_streak: number;
  longest_streak: number;
  last_login: string;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  extra?: string | React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  modalProps?: Partial<ModalProps>;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  loading?: boolean;
}
