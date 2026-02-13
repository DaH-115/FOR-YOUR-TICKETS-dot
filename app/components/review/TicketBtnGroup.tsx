import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import Link from "next/link";
import React, { useCallback } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";

interface TicketBtnGroupProps {
  postId: string;
  movieId: string;
  authorId: string;
  onReviewDeleted: (postId: string) => void;
}

const TicketBtnGroup = React.memo(function ReviewBtnGroup({
  postId,
  movieId,
  authorId,
  onReviewDeleted,
}: TicketBtnGroupProps) {
  const userState = useAppSelector(selectUser);

  // 현재 사용자가 리뷰 작성자인지 확인
  const isOwner = userState?.uid === authorId;

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    onReviewDeleted(postId);
  }, [onReviewDeleted, postId]);

  // 현재 사용자가 리뷰 작성자가 아니면 버튼 렌더링 X
  if (!isOwner) return null;

  return (
    <Menu as="div" className="relative">
      <MenuButton className="rounded-full bg-white p-2 transition hover:scale-110">
        <BsThreeDotsVertical className="text-gray-600" />
      </MenuButton>

      <MenuItems
        modal={false}
        transition
        className="absolute right-0 top-8 z-10 min-w-32 origin-top-right overflow-hidden rounded-lg bg-white shadow-xl transition duration-200 ease-out focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      >
        <MenuItem>
          <Link
            href={`/write-review/${postId}?movieId=${movieId}`}
            className="flex w-full items-center px-4 py-3 text-left text-xs font-medium text-gray-700 transition-colors data-focus:bg-gray-50 data-focus:text-gray-900"
          >
            <MdOutlineEdit className="mr-2 text-sm" />
            Edit
          </Link>
        </MenuItem>

        <div className="border-t border-gray-100">
          <MenuItem>
            <button
              onClick={handleDelete}
              className="flex w-full items-center px-4 py-3 text-left text-xs font-medium text-red-600 transition-colors data-focus:bg-gray-50 data-focus:text-red-700"
            >
              <MdDeleteOutline className="mr-2 text-sm" />
              Delete
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
});

export default TicketBtnGroup;
