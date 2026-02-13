"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { MdPerson, MdLogout } from "react-icons/md";
import ProfileAvatar from "@/components/user/ProfileAvatar";

interface HeaderDropDownMenuProps {
  userDisplayName: string | undefined;
  userPhotoURL: string | null | undefined;
  logoutHandler: () => void;
}

export default function HeaderDropDownMenu({
  userDisplayName,
  userPhotoURL,
  logoutHandler,
}: HeaderDropDownMenuProps) {
  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-3">
        <ProfileAvatar
          s3photoKey={userPhotoURL || undefined}
          userDisplayName={userDisplayName || "사용자"}
          size={32}
        />
        <span className="text-sm font-medium text-white transition-opacity">
          {userDisplayName ? userDisplayName : "사용자"} 님
        </span>
        <IoIosArrowDown
          size={12}
          className="text-white transition-transform data-open:rotate-180"
        />
      </MenuButton>

      <MenuItems
        modal={false}
        transition
        className="absolute -right-4 top-full z-10 mt-4 min-w-32 origin-top overflow-hidden rounded-lg bg-white shadow-xl transition duration-200 ease-out focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      >
        <MenuItem>
          <Link
            href="/my-page"
            className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors data-focus:bg-gray-50 data-focus:text-gray-900"
          >
            <MdPerson className="mr-2 text-sm text-gray-600" />
            나의 프로필
          </Link>
        </MenuItem>

        <div className="border-t border-gray-100">
          <MenuItem>
            <button
              onClick={logoutHandler}
              className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors data-focus:bg-gray-50 data-focus:text-red-600"
            >
              <MdLogout className="mr-2 text-sm text-gray-600" />
              로그아웃
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
