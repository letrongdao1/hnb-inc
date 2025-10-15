"use client";

import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  addToast,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownSLineIcon, LogoutIcon, UserIcon } from "../svg";
import { redirect, usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SYSTEM_MESSAGE } from "@/constants/system-message.enum";
import { useAppStore } from "@/providers/app-store.provider";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

const pageToHide = ["/auth/login", "/auth/signup", "/get-start"];

export default function Navbar() {
  const { isAuthenticated, user, setAuthenticated, setUser, setLoading } = useAppStore(
    (state) => state
  );
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logout = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      return addToast({
        title: SYSTEM_MESSAGE.SYSTEM_ERROR,
        color: "danger",
      });
    } else {
      setTimeout(() => {
        setAuthenticated(false);
        setUser(null);
      }, 2000);
      setLoading(false);
      redirect("/auth/login");
    }
  }, [setAuthenticated, setUser, setLoading]);

  const menuItems = useMemo(
    () => [
      { label: "Bảng tin", href: "/news", type: "link" },
      { label: "Sự kiện", href: "/events", type: "link" },
      { label: "Về HNB", href: "/about", type: "link" },
      { label: "Đăng xuất", href: "#", type: "button", onClick: () => logout() },
    ],
    [logout]
  );

  useEffect(() => {
    console.log({ isAuthenticated, user });
  }, [isAuthenticated, user]);

  if (pageToHide.some((page) => page === pathname)) return null;

  return (
    <HeroNavbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen}>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />

      <NavbarBrand className="text-inherit">
        <Link href="/" className="text-inherit">
          <AcmeLogo />
          <p className="font-bold text-inherit">HNB Hub</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden gap-8 text-white sm:flex" justify="center">
        {menuItems
          .filter((item) => item.type === "link")
          .map((item, index) => (
            <NavbarItem key={index}>
              <Link color="foreground" href={item.href}>
                {item.label}
              </Link>
            </NavbarItem>
          ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {isAuthenticated && user ? (
          <>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={<Avatar src={user.avatar} alt="" />}
                  endContent={<ArrowDownSLineIcon />}
                  className="border-none text-inherit"
                >
                  <p className="hidden max-w-24 overflow-hidden text-ellipsis whitespace-nowrap sm:inline">
                    {user.display_name}
                  </p>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Dropdown menu with description" variant="faded">
                <DropdownSection title="Tài khoản">
                  <DropdownItem
                    key="profile"
                    className="text-black"
                    color="default"
                    startContent={<UserIcon />}
                    onClick={() => redirect("profile")}
                  >
                    Xem hồ sơ
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    color="danger"
                    startContent={<LogoutIcon />}
                    onClick={logout}
                  >
                    Đăng xuất
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="/auth/login">Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" href="/auth/signup" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="pt-8">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              href={item.href}
              size="lg"
              onClick={() => {
                if (item.type === "button" && item.onClick) {
                  item.onClick();
                }
              }}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroNavbar>
  );
}
