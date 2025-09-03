"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getAddressByShopId, UpdateAddressById } from "@/services/api/address/address";
import { getMyShop, updateMyShop } from "@/services/api/shop/shop";
import { Edit, MapPin, Package, Phone, Save, Star, Store, TrendingUp, User, X } from "lucide-react";
import { useEffect, useState } from "react";

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

interface ShopFormData {
  shopName: string;
  description: string;
  logoURL: string;
  coverImageURL: string;
}

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
  const [editingShop, setEditingShop] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [shopForm, setShopForm] = useState<ShopFormData>({
    shopName: "",
    description: "",
    logoURL: "",
    coverImageURL: ""
  });
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    phoneNumber: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load shop and address from API on client mount
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getMyShop();
        const shopData = res && (res.data ?? res) ? (res.data ?? res) : null;
        if (!mounted) return;
        if (shopData) {
          setShop(shopData);
          setShopForm({
            shopName: shopData.shopName ?? "",
            description: shopData.description ?? "",
            logoURL: shopData.logoURL ?? "",
            coverImageURL: shopData.coverImageURL ?? ""
          });

          try {
            const id = String(shopData.id ?? shopData.shopId ?? "");
            if (id) {
              const addrRes = await getAddressByShopId(id);
              const addrData = addrRes && (addrRes.data ?? addrRes) ? (addrRes.data ?? addrRes) : null;
              if (mounted && addrData) {
                setAddress(addrData);
                setAddressForm({
                  street: addrData.street ?? "",
                  ward: addrData.ward ?? "",
                  district: addrData.district ?? "",
                  city: addrData.city ?? "",
                  country: addrData.country ?? "",
                  phoneNumber: addrData.phoneNumber ?? ""
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

  const handleShopSubmit = async () => {
    if (!shop?.id) return;

    setSaving(true);
    try {
      await updateMyShop(shop.id, shopForm);

      setShop(prev => prev ? { ...prev, ...shopForm } : null);
      setEditingShop(false);
      setError(null);
    } catch (error) {
      console.error("Error updating shop:", error);
      setError("Không thể cập nhật thông tin shop. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async () => {
    if (!address?.id) return;

    setSaving(true);
    try {
      const payload = {
        street: addressForm.street,
        ward: addressForm.ward,
        district: addressForm.district,
        city: addressForm.city,
        country: addressForm.country,
        phoneNumber: addressForm.phoneNumber,
      } as any;

      const res = await UpdateAddressById(address.id, payload);
      const updated = res && (res.data ?? res) ? (res.data ?? res) : res;

      setAddress(prev => prev ? { ...prev, ...updated } : (updated as Address));

      setEditingAddress(false);
      setError(null);
    } catch (error) {
      console.error("Error updating address:", error);
      setError("Không thể cập nhật địa chỉ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const cancelShopEdit = () => {
    if (shop) {
      setShopForm({
        shopName: shop.shopName || "",
        description: shop.description || "",
        logoURL: shop.logoURL || "",
        coverImageURL: shop.coverImageURL || ""
      });
    }
    setEditingShop(false);
  };

  const cancelAddressEdit = () => {
    if (address) {
      setAddressForm({
        street: address.street || "",
        ward: address.ward || "",
        district: address.district || "",
        city: address.city || "",
        country: address.country || "",
        phoneNumber: address.phoneNumber || ""
      });
    }
    setEditingAddress(false);
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white h-fit fixed z-50 w-full shadow">
        <div className="flex flex-col items-left space-x-3 bg-white h-fit w-full py-4 px-8">
          <div className="flex flex-row gap-2">
            <Store className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Quản lý cửa hàng</h1>
          </div>
          <h2 className="text-black/70">
            Quản lý cập nhật thông tin, địa chỉ cửa hàng
          </h2>
        </div>
      </div>

      <div className="w-full mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid mt-24 grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Shop Display Card */}
          <div className="space-y-6">
            {/* Cover Image & Logo - Taller Card */}
            <Card className="overflow-hidden h-full">
              <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                {shop.coverImageURL && (
                  <img
                    src={shop.coverImageURL}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                    {shop.logoURL ? (
                      <img
                        src={shop.logoURL}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="pt-14 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-gray-900">{shop.shopName}</h2>
                    <Badge variant={shop.status ? "default" : "secondary"} className="bg-green-100 text-green-800">
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
                      <span className="font-semibold text-xl">{shop.ratingAverage.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{shop.totalReview} đánh giá</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Package className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-xl">{shop.totalProduct}</span>
                    </div>
                    <p className="text-sm text-gray-500">Sản phẩm</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-xl">{shop.completeRate}%</span>
                    </div>
                    <p className="text-sm text-gray-500">Hoàn tất</p>
                  </div>
                </div>

                {/* Address Display */}
                {address && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Địa chỉ cửa hàng hiện tại</h3>
                    </div>
                    <div className="text-blue-700 space-y-2">
                      <p className="font-medium">
                        {address.street}, {address.ward}, {address.district}, {address.city}, {address.country}
                      </p>
                      <div className="flex items-center space-x-2 pt-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">{address.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Edit Forms */}
          <div className="space-y-6">
            {/* Shop Edit Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Store className="w-5 h-5" />
                    <span>Thông tin cửa hàng</span>
                  </CardTitle>
                  {!editingShop ? (
                    <Button onClick={() => setEditingShop(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleShopSubmit}
                        size="sm"
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button onClick={cancelShopEdit} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shopName">Tên cửa hàng</Label>
                  <Input
                    id="shopName"
                    value={shopForm.shopName}
                    onChange={(e) => setShopForm(prev => ({ ...prev, shopName: e.target.value }))}
                    disabled={!editingShop}
                    className={editingShop ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={shopForm.description}
                    onChange={(e) => setShopForm(prev => ({ ...prev, description: e.target.value }))}
                    disabled={!editingShop}
                    rows={3}
                    className={editingShop ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <Label htmlFor="logoURL">URL Logo</Label>
                  <Input
                    id="logoURL"
                    value={shopForm.logoURL}
                    onChange={(e) => setShopForm(prev => ({ ...prev, logoURL: e.target.value }))}
                    disabled={!editingShop}
                    placeholder="https://example.com/logo.jpg"
                    className={editingShop ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <Label htmlFor="coverImageURL">URL Ảnh bìa</Label>
                  <Input
                    id="coverImageURL"
                    value={shopForm.coverImageURL}
                    onChange={(e) => setShopForm(prev => ({ ...prev, coverImageURL: e.target.value }))}
                    disabled={!editingShop}
                    placeholder="https://example.com/cover.jpg"
                    className={editingShop ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Edit Form */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Địa chỉ cửa hàng</span>
                  </CardTitle>
                  {!editingAddress ? (
                    <Button onClick={() => setEditingAddress(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddressSubmit}
                        size="sm"
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button onClick={cancelAddressEdit} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Số nhà, tên đường</Label>
                  <Input
                    id="street"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                    disabled={!editingAddress}
                    placeholder="123 Đường ABC"
                    className={editingAddress ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ward">Phường/Xã</Label>
                    <Input
                      id="ward"
                      value={addressForm.ward}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, ward: e.target.value }))}
                      disabled={!editingAddress}
                      placeholder="Phường 1"
                      className={editingAddress ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <Input
                      id="district"
                      value={addressForm.district}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, district: e.target.value }))}
                      disabled={!editingAddress}
                      placeholder="Quận 1"
                      className={editingAddress ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!editingAddress}
                      placeholder="TP. Hồ Chí Minh"
                      className={editingAddress ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Quốc gia</Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                      disabled={!editingAddress}
                      placeholder="Việt Nam"
                      className={editingAddress ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!editingAddress}
                    placeholder="0123456789"
                    className={editingAddress ? "border-blue-300 focus:border-blue-500" : "bg-gray-50"}
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