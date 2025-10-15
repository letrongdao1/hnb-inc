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
import { useCallback, useMemo, useState } from "react";
import { ArrowDownSLineIcon, LogoutIcon, UserIcon } from "../svg";
import { redirect, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SYSTEM_MESSAGE } from "@/constants/system-message.enum";
import { UserInfo } from "@/interfaces/user";
import LogoComponent from "../logo/logo";

const pageToHide = ["/auth/login", "/auth/signup", "/get-start"];

export default function Navbar({ user }: { user: UserInfo | null }) {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

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
      setLoading(false);
      redirect("/auth/login");
    }
  }, [setLoading]);

  const menuItems = useMemo(
    () => [
      { label: "Bảng tin", href: "/news", type: "link" },
      { label: "Sự kiện", href: "/events", type: "link" },
      {
        label: "Danh sách",
        href: "",
        type: "button",
        children: [
          {
            label: "Thành viên HNB",
            href: "/members",
            type: "link",
          },
          {
            label: "Trụ sở & văn phòng",
            href: "/venues",
            type: "link",
          },
        ],
      },
      { label: "Về HNB", href: "/about", type: "link" },
      {
        label: "Đăng xuất",
        href: "#",
        type: "button",
        onClick: () => logout(),
        hiddenOnMain: true,
      },
    ],
    [logout]
  );

  if (pageToHide.some((page) => page === pathname)) return null;

  return (
    <HeroNavbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen}>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />

      <NavbarBrand className="text-inherit">
        <Link href="/" className="text-inherit">
          <LogoComponent />
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden gap-8 text-inherit sm:flex" justify="center">
        {menuItems
          .filter((item) => !Boolean(item.hiddenOnMain))
          .map((item, index) => {
            if (item.type === "link")
              return (
                <NavbarItem key={index}>
                  <Link color="foreground" href={item.href}>
                    {item.label}
                  </Link>
                </NavbarItem>
              );
            else if (item.type === "button") {
              return (
                <Dropdown key={index}>
                  <NavbarItem key={index}>
                    <DropdownTrigger>
                      <Button
                        disableRipple
                        variant="light"
                        endContent={<ArrowDownSLineIcon />}
                        radius="sm"
                        className="text-medium text-inherit"
                      >
                        {item.label}
                      </Button>
                    </DropdownTrigger>
                  </NavbarItem>

                  <DropdownMenu
                    aria-label="Danh sách"
                    itemClasses={{
                      base: "gap-4",
                    }}
                  >
                    {item.children && item.children.length
                      ? item.children.map((childItem, index) => (
                          <DropdownItem key={index} className="text-black">
                            {childItem.label}
                          </DropdownItem>
                        ))
                      : []}
                  </DropdownMenu>
                </Dropdown>
              );
            }
          })}
      </NavbarContent>

      <NavbarContent justify="end">
        {user ? (
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
              color={index === menuItems.length - 1 ? "danger" : "foreground"}
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
