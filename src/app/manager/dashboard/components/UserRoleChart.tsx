'use client'

import { Card } from '@/components/ui/card'
import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Users, Shield, Store } from 'lucide-react'

interface UserRoleData {
  role: string
  count: number
  color: string
  icon: React.ReactNode
  roleId: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: UserRoleData
  }>
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

function UserRoleChart() {
  const [loading, setLoading] = React.useState(true)
  const [userRoleData, setUserRoleData] = React.useState<UserRoleData[]>([])
  const [totalUsers, setTotalUsers] = React.useState(0)

  React.useEffect(() => {
    const fetchUserRoleData = async () => {
      setLoading(true)
      try {
        // TODO: Gọi API thực tế cho từng role
        // Customer (role = 1): https://brightpa.me/api/accounts/by-role/1
        // Seller (role = 2): https://brightpa.me/api/accounts/by-role/2
        // Moderator (role = 3): https://brightpa.me/api/accounts/by-role/3

        const [customerRes, sellerRes, moderatorRes] = await Promise.all([
          fetch('https://brightpa.me/api/accounts/by-role/1'),
          fetch('https://brightpa.me/api/accounts/by-role/2'),
          fetch('https://brightpa.me/api/accounts/by-role/3'),
        ])

        let customerCount = 0,
          sellerCount = 0,
          moderatorCount = 0

        if (customerRes.ok) {
          const customerData = await customerRes.json()
          customerCount = customerData.data?.length || 0
        }

        if (sellerRes.ok) {
          const sellerData = await sellerRes.json()
          sellerCount = sellerData.data?.length || 0
        }

        if (moderatorRes.ok) {
          const moderatorData = await moderatorRes.json()
          moderatorCount = moderatorData.data?.length || 0
        }
        console.log(customerRes, sellerRes, moderatorRes)

        // Nếu không có dữ liệu từ API, sử dụng dữ liệu demo
        if (customerCount === 0 && sellerCount === 0 && moderatorCount === 0) {
          customerCount = 850
          sellerCount = 320
          moderatorCount = 25
        }

        const roleData: UserRoleData[] = [
          {
            role: 'Customer',
            count: customerCount,
            color: '#3B82F6',
            icon: <Users className="w-4 h-4" />,
            roleId: 1,
          },
          {
            role: 'Seller',
            count: sellerCount,
            color: '#10B981',
            icon: <Store className="w-4 h-4" />,
            roleId: 2,
          },
          {
            role: 'Moderator',
            count: moderatorCount,
            color: '#F59E0B',
            icon: <Shield className="w-4 h-4" />,
            roleId: 3,
          },
        ]

        setUserRoleData(roleData)
        setTotalUsers(customerCount + sellerCount + moderatorCount)
      } catch (err) {
        console.error('Error fetching user role data:', err)
        // Fallback data
        const fallbackData: UserRoleData[] = [
          {
            role: 'Customer',
            count: 850,
            color: '#3B82F6',
            icon: <Users className="w-4 h-4" />,
            roleId: 1,
          },
          {
            role: 'Seller',
            count: 320,
            color: '#10B981',
            icon: <Store className="w-4 h-4" />,
            roleId: 2,
          },
          {
            role: 'Moderator',
            count: 25,
            color: '#F59E0B',
            icon: <Shield className="w-4 h-4" />,
            roleId: 3,
          },
        ]
        setUserRoleData(fallbackData)
        setTotalUsers(1195)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRoleData()
  }, [])

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.role}</p>
          <p className="text-blue-600">
            {`Số lượng: ${data.count.toLocaleString()}`}
          </p>
          <p className="text-gray-500">
            {`Tỷ lệ: ${((data.count / totalUsers) * 100).toFixed(1)}%`}
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: LabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl">Phân bố người dùng theo vai trò</h3>
          <p className="text-gray-500 text-sm">
            Tổng quan về các loại tài khoản
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="h-96 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-3">
            {userRoleData.map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-medium">{item.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((item.count / totalUsers) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t text-center">
            <div className="text-sm text-gray-500">Tổng số người dùng</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalUsers.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default UserRoleChart
