import useShowNavBar from "@/hooks/useShowNavBar";
import Sidebar from "./SideBar";

function Container({ children }: { children: React.ReactElement }) {
  const showNamvBar = useShowNavBar();
  console.log(showNamvBar);
  if (showNamvBar) {
    return <div className="h-screen w-full bg-background">{children}</div>;
  }
  return (
    <div className="h-screen w-full bg-background grid  grid-cols-[30%_70%] xl:grid-cols-[23%_77%]">
      <Sidebar />
      {children}
    </div>
  );
}

export default Container;
