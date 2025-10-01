import SideMenu from "@/my-page/components/SideMenu";
import { PrivateRoute } from "store/context/auth/authContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <div className="mx-4 flex lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px]">
        <SideMenu />
        {children}
      </div>
    </PrivateRoute>
  );
}
