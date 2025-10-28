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
  bank_code: string;
  bank_name: string;
  bank_short_name: string;
  bank_logo: string;
  is_selected: boolean;
  created_at?: string;
}
