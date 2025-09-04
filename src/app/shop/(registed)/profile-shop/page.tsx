"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
// import { Textarea } from "@/components/ui/textarea";
import { getAddressByShopId } from "@/services/api/address/address";
import { getMyShop } from "@/services/api/shop/shop";
import {
  Edit,
  MapPin,
  Package,
  // Save,
  Star,
  Store,
  TrendingUp,
  User,
  // X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import DialogUpdateAddress from "./DialogUpdateAddress";
import DialogupdateInfor from "./DialogupdateInfor";

interface Shop {
  id: string;
  shopName: string;
  description: string;
  logoURL: string;
  coverImageURL: string;
  ratingAverage: number;
  totalReview: number;
  totalProduct: number;
  completeRate: number;
  status: boolean;
}

interface Address {
  id: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  phoneNumber: string;
}

// ShopFormData no longer used; dialog writes directly to shop state

interface AddressFormData {
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  phoneNumber: string;
}

export default function Page() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  // no inline shop edit state, handled by dialog
  // inline address editing removed in favor of dialog
  // shop form state removed; we update directly from dialog into `shop`
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    phoneNumber: "",
  });
  // saving handled inside dialogs
  const [error, setError] = useState<string | null>(null);

  // Load shop and address from API on client mount
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getMyShop();
        const shopData = res && (res.data ?? res) ? res.data ?? res : null;
        if (!mounted) return;
        if (shopData) {
          setShop(shopData);

          try {
            const id = String(shopData.id ?? shopData.shopId ?? "");
            if (id) {
              const addrRes = await getAddressByShopId(id);
              const addrData =
                addrRes && (addrRes.data ?? addrRes)
                  ? addrRes.data ?? addrRes
                  : null;
              if (mounted && addrData) {
                setAddress(addrData);
                setAddressForm({
                  street: addrData.street ?? "",
                  ward: addrData.ward ?? "",
                  district: addrData.district ?? "",
                  city: addrData.city ?? "",
                  country: addrData.country ?? "",
                  phoneNumber: addrData.phoneNumber ?? "",
                });
              }
            }
          } catch (addrErr) {
            console.error("Error fetching address:", addrErr);
            if (!mounted) return;
            setAddress(null);
          }
        } else {
          setShop(null);
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
        if (!mounted) return;
        setError("Không thể tải thông tin cửa hàng.");
        setShop(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Skeleton className="w-full h-64 rounded-xl" />
              <Skeleton className="w-full h-32" />
            </div>
            <div className="space-y-6">
              <Skeleton className="w-full h-48" />
              <Skeleton className="w-full h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy thông tin shop.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col ">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">quản lí cửa hàng</h2>
        </div>
      </div>

      <div className="w-full mx-auto px-10">
        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid  mt-15 grid-cols-1 xl:grid-cols-2 gap-8 mb-5">
          {/* Left Column - Shop Display Card */}
          <div className="space-y-5">
            {/* Cover Image & Logo - Taller Card */}
            <Card className="overflow-hidden h-full rounded-none py-0">
              <div className="relative h-64 bg-gray-200">
                {shop.coverImageURL && (
                  <Image
                    src={shop.coverImageURL}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    layout="fill"
                  />
                )}
                <div className="flex gap-10">
                  <div className="absolute -bottom-14 left-6">
                    <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                      {shop.logoURL ? (
                        <Image
                          src={shop.logoURL}
                          alt="Logo"
                          className="w-full h-full rounded-full border- border-white object-cover"
                          layout="fill"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="pt-14 flex-1 pb-0">
                <div className="flex items-center justify-between mb-4 relative ">
                  <div className="flex items-center space-x-3 absolute -top-16 left-32">
                    <h2 className="text-xl font-bold text-gray-900">
                      {shop.shopName}
                    </h2>
                    <Badge
                      variant={shop.status ? "default" : "secondary"}
                      className="bg-green-100 text-green-800"
                    >
                      {shop.status ? "Đang hoạt động" : "Ngưng hoạt động"}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600 mb-8">{shop.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-xl">
                        {shop.ratingAverage.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {shop.totalReview} đánh giá
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Package className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-xl">
                        {shop.totalProduct}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Sản phẩm</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-xl">
                        {shop.completeRate}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Hoàn tất</p>
                  </div>
                </div>
                <div className="flex justify-end mb-5">
                  {shop && (
                    <DialogupdateInfor
                      shop={shop}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                        </Button>
                      }
                      onSuccess={(updated) => {
                        setShop((prev) =>
                          prev ? { ...prev, ...updated } : prev
                        );
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Edit Forms */}
          <div className="space-y-6">
            {/* Shop Edit Form */}

            {/* Address Edit Form */}
            <Card className="rounded-none h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Địa chỉ cửa hàng</span>
                  </CardTitle>
                  {address ? (
                    <DialogUpdateAddress
                      address={address}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      }
                      onSuccess={(updated) => {
                        if (!updated) return;
                        const merged = { ...address, ...updated };
                        setAddress(merged);
                        setAddressForm({
                          street: merged.street || "",
                          ward: merged.ward || "",
                          district: merged.district || "",
                          city: merged.city || "",
                          country: merged.country || "",
                          phoneNumber: merged.phoneNumber || "",
                        });
                      }}
                    />
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Số nhà, tên đường</Label>
                  <Input
                    id="street"
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    disabled={false}
                    placeholder="123 Đường ABC"
                    className={
                      false
                        ? "border-blue-300 focus:border-blue-500"
                        : "bg-gray-50"
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ward">Phường/Xã</Label>
                    <Input
                      id="ward"
                      value={addressForm.ward}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          ward: e.target.value,
                        }))
                      }
                      disabled={false}
                      placeholder="Phường 1"
                      className={
                        false
                          ? "border-blue-300 focus:border-blue-500"
                          : "bg-gray-50"
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Input
                      id="district"
                      value={addressForm.district}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          district: e.target.value,
                        }))
                      }
                      disabled={false}
                      placeholder="Quận 1"
                      className={
                        false
                          ? "border-blue-300 focus:border-blue-500"
                          : "bg-gray-50"
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      disabled={false}
                      placeholder="TP. Hồ Chí Minh"
                      className={
                        false
                          ? "border-blue-300 focus:border-blue-500"
                          : "bg-gray-50"
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Quốc gia</Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      disabled={false}
                      placeholder="Việt Nam"
                      className={
                        false
                          ? "border-blue-300 focus:border-blue-500"
                          : "bg-gray-50"
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={addressForm.phoneNumber}
                    onChange={(e) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    disabled={false}
                    placeholder="0123456789"
                    className={
                      false
                        ? "border-blue-300 focus:border-blue-500"
                        : "bg-gray-50"
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
