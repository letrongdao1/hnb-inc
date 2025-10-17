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
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { ArrowDownSLineIcon, LogoutIcon, OfficeIcon, UserGroupIcon, UserIcon } from "../svg";
import { redirect, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UserInfo } from "@/interfaces/user";
import LogoComponent from "../logo/logo";
import { SYSTEM_MESSAGE } from "@/constants/enums";
import "./index.scss";

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
            href: "/list/members",
            type: "link",
            icon: <UserGroupIcon />,
          },
          {
            label: "Trụ sở & văn phòng",
            href: "/list/venues",
            type: "link",
            icon: <OfficeIcon />,
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
    <HeroNavbar shouldHideOnScroll onMenuOpenChange={setIsMenuOpen} className="navbar-container">
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />

      <NavbarBrand className="cursor-pointer text-inherit">
        <Link onClick={() => redirect("/")} className="text-inherit">
          <LogoComponent responsive="lg" />
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden gap-8 text-inherit lg:flex" justify="center">
        {menuItems
          .filter((item) => !Boolean(item.hiddenOnMain))
          .map((item, index) => {
            if (item.type === "link")
              return (
                <NavbarItem key={index}>
                  <Link
                    color="foreground"
                    onClick={() => redirect(item.href)}
                    className="cursor-pointer"
                  >
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
                        className="text-medium text-inherit hover:!bg-transparent hover:brightness-50"
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
                            <Link
                              onClick={() => redirect(childItem.href)}
                              className="flex items-center gap-2 text-inherit"
                            >
                              {childItem.icon}
                              {childItem.label}
                            </Link>
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
                startContent={<Avatar isBordered src={user.avatar} alt="" />}
                endContent={<ArrowDownSLineIcon />}
                className="h-full border-none text-inherit px-0 sm:px-1"
              >
                <p className="hidden h-fit max-w-24 overflow-hidden px-1 text-ellipsis whitespace-nowrap sm:inline">
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
                  onClick={() => redirect("/profile")}
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
        {menuItems.map((item, index) => {
          if (item.type === "link")
            return (
              <NavbarMenuItem key={`${item}-${index}`} className="px-2">
                <Link
                  className="w-full"
                  color={index === menuItems.length - 1 ? "danger" : "foreground"}
                  href={item.href}
                  onClick={() => {
                    if (item.type === "button" && item.onClick) {
                      item.onClick();
                    }
                  }}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          else if (item.type === "button") {
            if (item.children) {
              return (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Accordion>
                    <AccordionItem title={item.label}>
                      <div className="flex flex-col items-stretch justify-start gap-2">
                        {item.children.map((childItem, i) => (
                          <Link href={childItem.href} key={i}>
                            {childItem.label}
                          </Link>
                        ))}
                      </div>
                    </AccordionItem>
                  </Accordion>
                </NavbarMenuItem>
              );
            } else if (item.onClick) {
              return (
                <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                    className="w-full"
                    color={index === menuItems.length - 1 ? "danger" : "foreground"}
                    href={item.href}
                    size="lg"
                    onClick={() => {
                      item.onClick();
                    }}
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              );
            }
          }
        })}
      </NavbarMenu>
    </HeroNavbar>
  );
}
