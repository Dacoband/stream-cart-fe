"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Eye, Clock, Users, Play } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getLivestreamStatisticsByShopWithDateFilter } from '@/services/api/livestream/livestream';

interface LivestreamStats {
  totalLivestreams?: number;
  totalDuration?: number;
  totalViewers?: number;
  averageDuration?: number;
  averageViewers?: number;
}

function LivestreamStatistics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LivestreamStats | null>(null);

  const getLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      fromDate: sevenDaysAgo.toISOString(),
      toDate: today.toISOString()
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.shopId) return;
      
      setLoading(true);
      try {
        const { fromDate, toDate } = getLast7Days();
        const data = await getLivestreamStatisticsByShopWithDateFilter(
          user.shopId,
          fromDate,
          toDate
        );
        setStats(data);
      } catch (error) {
        console.error('Error fetching livestream statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.shopId]);

  const formatDuration = (minutes: number) => {
    const total = Math.floor(Number(minutes) || 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    // Format without decimal and without extra spaces: '61h52m' or '52m'
    return hours > 0 ? `${hours}h${mins}m` : `${mins}m`;
  };

  return (
    <Card className="shadow-sm h-full w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Play className="text-red-500" size={24} />
          Thống kê Livestream (7 ngày gần nhất)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Tổng thời gian */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tổng thời gian</p>
                <p className="text-2xl font-extrabold text-blue-800 leading-tight">
                  {loading ? '...' : formatDuration(stats?.totalDuration ?? 0)}
                </p>
              </div>
              <div className="bg-blue-200 rounded-full p-2">
                <Clock className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          {/* Tổng lượt xem */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Tổng lượt xem</p>
                <p className="text-2xl font-extrabold text-green-800 leading-tight">
                  {loading ? '...' : (stats?.totalViewers ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-200 rounded-full p-2">
                <Eye className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          {/* Thời gian trung bình */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">TB thời gian</p>
                <p className="text-2xl font-extrabold text-orange-800 leading-tight">
                  {loading ? '...' : formatDuration(stats?.averageDuration ?? 0)}
                </p>
              </div>
              <div className="bg-orange-200 rounded-full p-2">
                <Calendar className="text-orange-600" size={20} />
              </div>
            </div>
          </div>

          {/* Lượt xem trung bình */}
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200 w-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 text-sm font-medium">TB lượt xem</p>
                <p className="text-2xl font-extrabold text-pink-800 leading-tight">
                  {loading ? '...' : Math.round(stats?.averageViewers ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-pink-200 rounded-full p-2">
                <Users className="text-pink-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LivestreamStatistics;
