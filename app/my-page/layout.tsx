import MobileMenu from "@/my-page/components/menu/MobileMenu";
import SideMenu from "@/my-page/components/menu/SideMenu";
import { PrivateRoute } from "store/context/auth/PrivateRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <div className="mx-4 md:mx-8 lg:mx-12 lg:flex xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px]">
        <MobileMenu />
        <SideMenu />
        {children}
      </div>
    </PrivateRoute>
  );
}
