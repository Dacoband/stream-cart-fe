import Navigation from "../payment/components/NavigationPayment";

export default async function LayoutPayment({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="fixed top-0 left-0 right-0  h-[8vh] w-full z-50">
          <Navigation />
        </div>
        <div className="pt-[8vh] min-h-[calc(100vh-80px)] flex items-center justify-center">
          {/* Wrap content as needed */}
          {children}
        </div>
      </div>
    </div>
  );
}
