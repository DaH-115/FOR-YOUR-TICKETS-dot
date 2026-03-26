import MobileMenu from "@/my-page/components/menu/MobileMenu";
import SideMenu from "@/my-page/components/menu/SideMenu";
import { PrivateRoute } from "store/context/auth/PrivateRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <div className="mx-8 flex flex-col lg:mx-0 lg:flex-row xl:mx-auto xl:max-w-7xl">
        <MobileMenu />
        <SideMenu />
        <div className="flex w-full flex-col items-center lg:flex-1">
          {children}
        </div>
      </div>
    </PrivateRoute>
  );
}
