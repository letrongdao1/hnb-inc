"use client";

import { UserInfo } from "@/interfaces/user";
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext<{
  user: UserInfo | null;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
}>({
  user: null,
  setUser: () => {},
});

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser: UserInfo | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserInfo | null>(initialUser);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
