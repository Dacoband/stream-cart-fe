import Navigation from "./components/Navigation";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 bg-black h-16 w-full z-50">
        <Navigation />
      </div>
      <div className="flex flex-1 w-full pt-16">
        <div className="flex-1 px-10 py-8 bg-[#fbfbfb]">{children}</div>
      </div>
    </div>
  );
}
