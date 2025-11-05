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
import "./index.scss";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowDownSLineIcon,
  LogoutIcon,
  MoonIcon,
  OfficeIcon,
  PaleteIcon,
  SettingIcon,
  SunIcon,
  UserGroupIcon,
  UserIcon,
} from "../svg";
import { createClient } from "@/lib/supabase/client";
import LogoComponent from "../logo/logo";
import { ROLE, SYSTEM_MESSAGE } from "@/constants/enums";
import { useUser } from "@/providers/user.providers";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { RoleUtils } from "@/utils/role.utils";

const pageToHide = ["/auth/login", "/auth/signup", "/get-start"];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

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
      router.replace("/auth/login");
    }
  }, [router, setLoading]);

  const menuItems = useMemo(
    () => [
      { label: "Bảng tin", href: "/news", type: "link" },
      { label: "Sự kiện", href: "/events", type: "link" },
      {
        label: "Danh sách",
        href: "",
        type: "button",
        hidden: true,
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

  const userMenuItems = useMemo(
    () =>
      !user
        ? []
        : [
            {
              key: "management",
              title: "Quản trị",
              hidden: !RoleUtils.checkIsRole(user, ROLE.BOT),
              children: [
                {
                  key: "hub-mmanagement",
                  icon: <SettingIcon />,
                  title: "Quản lý nội dung",
                  onClick: () => router.push("/management/hub/news"),
                },
              ],
            },
            {
              key: "account",
              title: "Tài khoản",
              children: [
                {
                  key: "profile",
                  icon: <UserIcon />,
                  title: "Quản lý tài khoản",
                  onClick: () => router.push("/profile"),
                },
              ],
            },
            {
              key: "system",
              title: "Hệ thống",
              children: [
                {
                  key: "theme",
                  icon: <PaleteIcon />,
                  title: (
                    <div className="flex items-center justify-between">
                      <p>Giao diện</p>
                      <Button
                        isIconOnly
                        variant="shadow"
                        radius="full"
                        size="sm"
                        aria-label="Toggle theme"
                        onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="overflow-hidden bg-transparent"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {theme === "light" ? (
                            <motion.div
                              key="sun"
                              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                              animate={{ rotate: 0, opacity: 1, scale: 1 }}
                              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.3 }}
                            >
                              <SunIcon className="h-5 w-5 text-yellow-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="moon"
                              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                              animate={{ rotate: 0, opacity: 1, scale: 1 }}
                              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.3 }}
                            >
                              <MoonIcon className="h-5 w-5 text-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  ),
                  onClick: () => {},
                  isReadOnly: true,
                },
              ],
            },
            {
              key: "action",
              title: "",
              hideDivider: true,
              children: [
                {
                  key: "logout",
                  icon: <LogoutIcon />,
                  title: "Đăng xuất",
                  onClick: logout,
                  danger: true,
                },
              ],
            },
          ],
    [theme, setTheme, logout, router, user]
  );

  if (pageToHide.some((page) => page === pathname)) return null;

  return (
    <HeroNavbar
      shouldHideOnScroll
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="navbar-container"
    >
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />

      <NavbarBrand className="cursor-pointer text-inherit">
        <Link onClick={() => router.push("/")} className="text-inherit">
          <LogoComponent responsive="lg" />
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden gap-8 text-inherit lg:flex" justify="center">
        {menuItems
          .filter((item) => !Boolean(item.hiddenOnMain))
          .map((item, index) => {
            if (item.hidden) return null;

            if (item.type === "link")
              return (
                <NavbarItem key={index} isActive={pathname === item.href}>
                  <Link
                    color="foreground"
                    onClick={() => router.push(item.href)}
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
                          <DropdownItem key={index}>
                            <Link
                              onClick={() => router.push(childItem.href)}
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
                className="h-full border-none px-0 text-inherit sm:px-1"
              >
                <p className="hidden h-fit max-w-24 overflow-hidden px-1 text-ellipsis whitespace-nowrap sm:inline">
                  {user.display_name}
                </p>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="faded">
              {userMenuItems &&
                Array.isArray(userMenuItems) &&
                (userMenuItems as any).map((menuItem: any) => (
                  <DropdownSection
                    key={menuItem.key}
                    title={menuItem.title}
                    showDivider={!Boolean(menuItem.hideDivider)}
                    hidden={menuItem.hidden}
                  >
                    {menuItem &&
                      menuItem.children &&
                      Array.isArray(menuItem.children) &&
                      menuItem.children.map((item: any) => (
                        <DropdownItem
                          key={item.key}
                          color={item.danger ? "danger" : "default"}
                          startContent={item.icon}
                          onPress={item.onClick}
                          isReadOnly={item.isReadOnly}
                        >
                          {item.title}
                        </DropdownItem>
                      ))}
                  </DropdownSection>
                ))}
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="/auth/login">Đăng nhập</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" href="/auth/signup" variant="flat">
                Đăng ký
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu className="pt-8">
        {menuItems.map((item, index) => {
          if (item.hidden) return null;

          if (item.type === "link")
            return (
              <NavbarMenuItem
                key={`${item}-${index}`}
                isActive={pathname === item.href}
                className="px-2"
              >
                <Link
                  className="w-full"
                  color={index === menuItems.length - 1 ? "danger" : "foreground"}
                  onClick={() => {
                    router.push(item.href);
                    setIsMenuOpen(false);
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
