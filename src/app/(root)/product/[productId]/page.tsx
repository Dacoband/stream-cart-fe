import BreadcrumbProduct from "../components/BreadcrumbProduct";
import OperationProduct from "../components/OperationProduct";
interface ProductPageProps {
  params: { productId: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="flex flex-col w-[70%] mx-auto">
      <div className="my-2.5">
        <BreadcrumbProduct />
      </div>
      <div className="">
        <div className="bg-white py-8 rounded-sm  mx-auto">
          <OperationProduct />
        </div>
      </div>
    </div>
  );
}
