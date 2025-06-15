import Navigation from "./components/Navigation";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="fixed top-0 left-0 right-0  bg-black h-20 w-full z-50">
        <Navigation />
      </div>
      <div className="flex flex-1 w-full pt-16 justify-center">
        <div className="w-full  py-8 ">{children}</div>
      </div>
    </div>
  );
}
