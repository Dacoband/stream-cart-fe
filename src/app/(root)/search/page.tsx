"use client";
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProducts, getProductsByShopId } from '@/services/api/product/product';
import { searchShops } from '@/services/api/shop/shop';
import type { ShopSearchResult } from '@/types/shop/shop';
import type { ProductSearchParams, SearchProductsPage } from '@/types/product/product';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, ShoppingCart, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PriceTag from '@/components/common/PriceTag';

interface LocalFilterState { categoryId?: string; minPrice?: number; maxPrice?: number; inStockOnly?: boolean; onSaleOnly?: boolean; minRating?: number; sortBy?: string; }
const initialFilters: LocalFilterState = {};

function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get('q')?.trim() || '';
  const legacyType = params.get('type');
  const [filters, setFilters] = React.useState<LocalFilterState>(initialFilters);
  const [initialLoading, setInitialLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const pageSize = 20;
  interface SearchCardProduct {
    id: string;
    productName: string;
    finalPrice: number;
    discountPrice: number;
    basePrice: number;
    quantitySold: number;
    averageRating?: number;
    discountPercentage?: number;
    primaryImageUrl?: string;
  }
  const [products, setProducts] = React.useState<SearchCardProduct[]>([]);
  const [shops, setShops] = React.useState<ShopSearchResult[]>([]);
  const [shopProducts, setShopProducts] = React.useState<SearchCardProduct[]>([]);
  const [loadingShopProducts, setLoadingShopProducts] = React.useState(false);
  const [meta, setMeta] = React.useState<SearchProductsPage | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const fetchingRef = React.useRef(false);

  const loadedFiltersRef = React.useRef(false);
  React.useEffect(() => {
    if (loadedFiltersRef.current) return;
    loadedFiltersRef.current = true;
    const f: LocalFilterState = {};
    const gp = (n: string) => params.get(n);
    const num = (v: string | null) => (v !== null && v !== '' ? Number(v) : undefined);
    const bool = (v: string | null) => (v === 'true' ? true : v === 'false' ? false : undefined);
    f.minPrice = num(gp('minPrice'));
    f.maxPrice = num(gp('maxPrice'));
    f.inStockOnly = bool(gp('inStockOnly'));
    f.onSaleOnly = bool(gp('onSaleOnly'));
    f.minRating = num(gp('minRating'));
    f.sortBy = gp('sortBy') || undefined;
    f.categoryId = gp('categoryId') || undefined;
    setFilters(f);
  }, [params]);

  const buildQuery = React.useCallback((overrides: Partial<{ q: string }> = {}) => {
    const qp = new URLSearchParams();
    const qq = overrides.q ?? q;
    if (qq) qp.set('q', qq);
    if (filters.minPrice !== undefined) qp.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) qp.set('maxPrice', String(filters.maxPrice));
    if (filters.inStockOnly !== undefined) qp.set('inStockOnly', String(filters.inStockOnly));
    if (filters.onSaleOnly !== undefined) qp.set('onSaleOnly', String(filters.onSaleOnly));
    if (filters.minRating !== undefined) qp.set('minRating', String(filters.minRating));
    if (filters.sortBy) qp.set('sortBy', filters.sortBy);
    if (filters.categoryId) qp.set('categoryId', filters.categoryId);
    return qp.toString();
  }, [q, filters]);

  const fetchPage = React.useCallback(async (page: number, replace = false) => {
  if (!q || fetchingRef.current) return;
    fetchingRef.current = true;
    if (page === 1) { setInitialLoading(true); setError(null); } else setLoadingMore(true);
    try {
        const req: ProductSearchParams = {
        searchTerm: q,
        pageNumber: page,
        pageSize,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStockOnly: filters.inStockOnly,
        onSaleOnly: filters.onSaleOnly,
        minRating: filters.minRating,
        sortBy: filters.sortBy || 'relevance'
      };
      const res = await searchProducts(req);
      const newMeta = res.data.products;
      setMeta(newMeta);
      setProducts(prev => replace ? newMeta.items : [...prev, ...newMeta.items]);
      setPageNumber(page + 1);
    } catch (e: unknown) {
      interface ErrLike { message?: string }
      const msg = (typeof e === 'object' && e !== null && 'message' in e) ? (e as ErrLike).message || 'Lỗi tìm kiếm' : 'Lỗi tìm kiếm';
      setError(msg);
    } finally {
      fetchingRef.current = false; setInitialLoading(false); setLoadingMore(false);
    }
  }, [q, filters]);


  React.useEffect(() => {
    if (legacyType === 'shop') {
      router.replace(`/search?${buildQuery()}`);
      return;
    }
    setProducts([]); setMeta(null); setPageNumber(1);
    if (!q) return;
    fetchPage(1, true);
  }, [q, filters, fetchPage, legacyType, buildQuery, router]);

  React.useEffect(() => {
    if (!q) { setShops([]); return; }
    (async () => {
      try {
        const res = await searchShops(q);
        setShops(res);
      } catch {
      }
    })();
  }, [q]);

  React.useEffect(() => {
    const top = shops[0];
    if (!top) { setShopProducts([]); return; }
    let cancelled = false;
    (async () => {
      try {
        setLoadingShopProducts(true);
        const res = await getProductsByShopId(top.id, true);
        if (cancelled) return;
  interface RawShopProduct { id:string; productName:string; finalPrice?:number; discountPrice?:number; basePrice?:number; quantitySold?:number; averageRating?:number; primaryImageUrl?:string; }
  const items = ((res || []) as RawShopProduct[]).slice(0,12).map((p:RawShopProduct) => ({
          id: p.id,
          productName: p.productName,
          finalPrice: p.finalPrice ?? p.discountPrice ?? p.basePrice,
          discountPrice: p.discountPrice ?? 0,
          basePrice: p.basePrice ?? 0,
          quantitySold: p.quantitySold ?? 0,
          averageRating: p.averageRating,
          discountPercentage: p.basePrice && p.finalPrice && p.basePrice>p.finalPrice ? Math.round((1 - p.finalPrice / p.basePrice) * 100) : undefined,
          primaryImageUrl: p.primaryImageUrl
        })) as SearchCardProduct[];
        setShopProducts(items);
      } catch {
        if (!cancelled) setShopProducts([]);
      } finally { if (!cancelled) setLoadingShopProducts(false); }
    })();
    return () => { cancelled = true; };
  }, [shops]);

  React.useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(entries => {
      const first = entries[0];
      if (first.isIntersecting && meta && products.length < meta.totalCount && !initialLoading && !loadingMore) {
        fetchPage(pageNumber);
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [meta, products.length, initialLoading, loadingMore, pageNumber, fetchPage]);

  const applyFilters = () => { router.replace(`/search?${buildQuery()}`); };
  const clearFilters = () => { setFilters(initialFilters); router.replace(`/search?q=${encodeURIComponent(q)}`); };
  // Shimmer skeleton card for smooth loading
  const ShimmerCard: React.FC = () => (
    <div className="border border-gray-200 bg-white rounded-none overflow-hidden">
      <div className="w-full aspect-square">
        <div className="sc-shimmer w-full h-full" />
      </div>
      <div className="p-3 space-y-2">
        <div className="sc-shimmer h-4 w-3/4 rounded" />
        <div className="sc-shimmer h-4 w-1/2 rounded" />
      </div>
      <div className="sc-shimmer h-8" />
    </div>
  );
  const ProductCard: React.FC<{ product: SearchCardProduct; compact?: boolean }> = ({ product, compact }) => {
    const showDiscount = (product.discountPercentage && product.discountPercentage > 0) || (product.discountPrice > 0 && product.discountPrice < product.basePrice);
    const percent = product.discountPercentage || (product.basePrice && product.finalPrice && product.basePrice > product.finalPrice
      ? Math.round((1 - product.finalPrice / product.basePrice) * 100)
      : undefined);
    const goDetail = (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(`/product/${product.id}`);
    };
    return (
      <Link href={`/product/${product.id}`} className="group block h-full">
        <div className={`flex flex-col h-full bg-white rounded-none border transition-all duration-300 hover:shadow-xl overflow-hidden ${compact ? '' : 'hover:-translate-y-1'} border-gray-200`}>
          <div className="relative w-full aspect-square overflow-hidden">
            {product.primaryImageUrl ? (
              <Image
                src={product.primaryImageUrl}
                alt={product.productName}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><ImageIcon size={40} /></div>
            )}
            {showDiscount && percent !== undefined && (
              <div className="absolute top-2 right-2 bg-[#B7F560] text-black px-2 py-1 rounded text-xs font-bold">-{percent}%</div>
            )}
          </div>
          <div className="flex flex-col flex-1 px-3 pt-2 pb-3">
            <h4 className={`font-medium text-gray-900 line-clamp-2 mb-2 ${compact ? 'text-[11px] min-h-[36px]' : 'text-sm min-h-[48px]'}`}>{product.productName}</h4>
            <div className="mt-auto">
              <div className="flex items-end justify-between gap-4 mb-2">
                <span className={`font-semibold text-[#7FB800] ${compact ? 'text-sm' : 'text-lg'}`}>
                  <PriceTag value={product.finalPrice} />
                </span>
                <span className="text-[10px] text-gray-500">Đã bán {product.quantitySold}</span>
              </div>
              {compact && (
                <Button
                  size="sm"
                  className="w-full h-7 text-[11px] rounded bg-[#9FE040] hover:bg-[#9FE040]/80 text-white font-medium shadow-inner transition-colors"
                  onClick={goDetail}
                >
                  <ShoppingCart className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          {!compact && (
            <Button
              size="sm"
              className="w-full rounded-none text-white font-medium shadow-inner bg-[#9FE040] hover:bg-[#9FE040]/80 transition-colors"
              onClick={goDetail}
            >
              <ShoppingCart className="w-3 h-3 mr-1"/> Thêm vào giỏ
            </Button>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="px-16 2xl:px-32 py-4 space-y-4">
      <div className="grid grid-cols-12 gap-6">
        <aside className={`col-span-12 md:col-span-3 xl:col-span-2 text-xs`}> 
          <div className="flex items-center gap-2 mb-5 font-semibold text-slate-800 dark:text-slate-200 text-sm">
            <Filter size={16} className="text-[#B0F847]"/> <span className="uppercase tracking-wide">Bộ lọc tìm kiếm</span>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">Khoảng giá</div>
              <div className="flex items-center gap-2">
                <Input type="number" inputMode="numeric" value={filters.minPrice ?? ''} onChange={e=> setFilters(f=>({...f,minPrice:e.target.value?Number(e.target.value):undefined}))} placeholder="TỪ" className="bg-white text-black h-8 text-xs" />
                <span className="text-slate-400">-</span>
                <Input type="number" inputMode="numeric" value={filters.maxPrice ?? ''} onChange={e=> setFilters(f=>({...f,maxPrice:e.target.value?Number(e.target.value):undefined}))} placeholder="ĐẾN" className="bg-white text-black h-8 text-xs" />
              </div>
            </div>
            <div className="h-px bg-gray-200 dark:bg-[#2c3035]" />
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">Tình trạng</div>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"><input type="checkbox" className="accent-[#B0F847]" checked={!!filters.inStockOnly} onChange={e=> setFilters(f=>({...f,inStockOnly:e.target.checked||undefined}))}/>Còn hàng</label>
            </div>
            <div className="h-px bg-gray-200 dark:bg-[#2c3035]" />
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">Khuyến mãi</div>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"><input type="checkbox" className="accent-[#B0F847]" checked={!!filters.onSaleOnly} onChange={e=> setFilters(f=>({...f,onSaleOnly:e.target.checked||undefined}))}/>Đang giảm giá</label>
            </div>
            <div className="h-px bg-gray-200 dark:bg-[#2c3035]" />
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">Đánh giá</div>
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"><input type="checkbox" className="accent-[#B0F847]" checked={filters.minRating===4} onChange={e=> setFilters(f=>({...f,minRating:e.target.checked?4:undefined}))}/>Từ 4★ trở lên</label>
            </div>
            <div className="h-px bg-gray-200 dark:bg-[#2c3035]" />
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">Sắp xếp</div>
              <select value={filters.sortBy || 'relevance'} onChange={e=> setFilters(f=>({...f,sortBy: e.target.value==='relevance'?undefined:e.target.value}))} className="w-full text-xs bg-white text-black py-1 px-2 rounded border border-gray-300">
                <option value="relevance">Liên quan</option>
                <option value="newest">Mới nhất</option>
                <option value="sold_desc">Bán chạy</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating_desc">Đánh giá cao</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="secondary" className="flex-1 bg-[#9FE040] text-black hover:brightness-95 hover:text-black font-semibold" onClick={applyFilters}>Áp dụng</Button>
              <Button size="sm" variant="ghost" className="flex-1 text-slate-500 hover:text-black" onClick={clearFilters}>Đặt lại</Button>
            </div>
          </div>
        </aside>

        <section className="col-span-12 md:col-span-9 xl:col-span-10 space-y-4 min-h-[400px]">
          {shops.length > 0 && (
            <div className="bg-[#fdfdfd] p-5 flex flex-col sm:flex-row gap-5 items-center">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#2c3035] bg-[#2c3035]">
                  {(shops[0].logoURL || shops[0].logoUrl) ? (
                    <Image src={(shops[0].logoURL||shops[0].logoUrl)!} alt={shops[0].shopName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">No Logo</div>
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-semibold text-sm text-slate-900 line-clamp-1">{shops[0].shopName}</div>
                  <div className="text-[11px] text-slate-900 flex flex-wrap gap-x-3 gap-y-1">
                    <span>{shops[0].totalProduct} sản phẩm</span>
                    <span>{shops[0].ratingAverage?.toFixed?.(1) || '0'}★</span>
                    {shops[0].completeRate !== undefined && <span>{shops[0].completeRate}% phản hồi</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 max-w-md">{shops[0].description || 'Không có mô tả'}</div>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#B0F847] text-black hover:brightness-90"
                  onClick={() => router.push(`/store/${shops[0].id}`)}
                >
                  Xem shop
                </Button>
              </div>
            </div>
          )}
          {
            <div className="flex flex-wrap items-center gap-2 bg-[#ffffff] px-4 py-3 text-[11px] md:text-xs">
              <span className="text-slate-400 mr-1">Sắp xếp theo:</span>
              {[
                { label:'Liên quan', val:'relevance' },
                { label:'Mới nhất', val:'newest' },
                { label:'Bán chạy', val:'sold_desc' },
                { label:'Giá ↑', val:'price_asc' },
                { label:'Giá ↓', val:'price_desc' },
                { label:'Đánh giá', val:'rating_desc' },
              ].map(o => (
                <button key={o.val} onClick={()=> { setFilters(f=>({...f, sortBy: o.val==='relevance'? undefined: o.val })); router.replace(`/search?${buildQuery()}`); }} className={`px-3 py-1 rounded-sm font-medium border ${ (filters.sortBy||'relevance')===o.val ? 'bg-[#B0F847] text-black border-[#B0F847]' : 'border-transparent bg-[#23272b] text-slate-300 hover:text-[#B0F847]'}`}>{o.label}</button>
              ))}
            </div>
          }
          {!initialLoading && !error && q && meta && (meta.totalCount>0 || shopProducts.length===0) && (
            <div className="text-xs md:text-sm text-slate-400">Tìm thấy <span className="text-[#B0F847] font-medium">{meta.totalCount}</span> sản phẩm cho &quot;{q}&quot;</div>
          )}
          {initialLoading && (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {Array.from({length:10}).map((_,i)=> (
                <ShimmerCard key={i} />
              ))}
            </div>
          )}
          {error && !initialLoading && <div className="text-red-500">{error}</div>}
          {!initialLoading && q && !error && products.length===0 && shopProducts.length===0 && (
            <div className="p-8 text-center border rounded bg-[#1f2226] text-slate-300">Không tìm thấy kết quả cho “{q}”.</div>
          )}
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {products.filter(p => !shopProducts.some(sp => sp.id===p.id)).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {shops.length>0 && (
            <div className="space-y-2 mt-8">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-semibold text-shadow-slate-700">
                  {(!initialLoading && !error && meta && meta.totalCount===0 && shopProducts.length>0)
                    ? <>Không tìm thấy sản phẩm khớp “{q}”. Gợi ý sản phẩm từ cửa hàng liên quan</>
                    : 'Sản phẩm từ cửa hàng liên quan'}
                </h3>
                {loadingShopProducts && <span className="text-[10px] text-slate-500">Đang tải...</span>}
              </div>
              {shopProducts.length>0 && (
                <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                  {shopProducts.map(p => (
                    <ProductCard key={p.id} product={p} compact />
                  ))}
                </div>
              )}
              {!loadingShopProducts && shopProducts.length===0 && <div className="text-[11px] text-slate-500">Không có sản phẩm hiển thị.</div>}
            </div>
          )}
          {loadingMore && (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-5 mt-4">
              {Array.from({length:5}).map((_,i)=> (
                <ShimmerCard key={i} />
              ))}
            </div>
          )}
          <div ref={sentinelRef} className="h-8" />
          {!loadingMore && meta && products.length < meta.totalCount && (
            <div className="text-center text-xs text-slate-500">Cuộn để tải thêm...</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SearchPage;