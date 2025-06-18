import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

export default async function LayoutCustomer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="fixed top-0 left-0 right-0   h-20 w-full z-50">
          <Navigation />
        </div>
        <div className="flex flex-1 w-full pt-16 justify-center">
          <div className="  py-8 ">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
