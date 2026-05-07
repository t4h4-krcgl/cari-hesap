/**
 * Dashboard Page
 * Main dashboard showing statistics and recent transactions
 */

import React, { useEffect, useState } from 'react';
import { Card, Spinner } from '../components/UI';
import { Header, Sidebar, DataTable } from '../components/Layout';
import { apiService } from '../services/api';
import type { DashboardStats } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useNotification } from '../hooks/useCommon';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.dashboard.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err: any) {
        addNotification(
          'İstatistikler yükleme başarısız',
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Müşteri',
      value: stats?.totalCari || 0,
      icon: '👥',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Toplam Borç (TL)',
      value: formatCurrency(stats?.totalBorc.TL || 0, 'TL'),
      icon: '📉',
      color: 'bg-red-50 border-red-200',
    },
    {
      title: 'Toplam Ödeme (TL)',
      value: formatCurrency(stats?.totalOdeme.TL || 0, 'TL'),
      icon: '📈',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Toplam Borç (USD)',
      value: formatCurrency(stats?.totalBorc.USD || 0, 'USD'),
      icon: '🌍',
      color: 'bg-yellow-50 border-yellow-200',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            {/* Statistics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, idx) => (
                <Card key={idx} className={`border ${stat.color}`}>
                  <div className="flex items-center">
                    <span className="text-4xl mr-4">{stat.icon}</span>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Multi-Currency Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Borç Summary */}
              <Card title="Toplam Borç">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">TL</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.totalBorc.TL || 0, 'TL')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">USD</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.totalBorc.USD || 0, 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Altın (oz)</span>
                    <span className="font-semibold">
                      {(stats?.totalBorc.Altin || 0).toFixed(2)} oz
                    </span>
                  </div>
                </div>
              </Card>

              {/* Ödeme Summary */}
              <Card title="Toplam Ödeme">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">TL</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.totalOdeme.TL || 0, 'TL')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">USD</span>
                    <span className="font-semibold">
                      {formatCurrency(stats?.totalOdeme.USD || 0, 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Altın (oz)</span>
                    <span className="font-semibold">
                      {(stats?.totalOdeme.Altin || 0).toFixed(2)} oz
                    </span>
                  </div>
                </div>
              </Card>

              {/* Net Balance */}
              <Card title="Net Bakiye">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">TL</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        (stats?.totalBorc.TL || 0) - (stats?.totalOdeme.TL || 0),
                        'TL'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">USD</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        (stats?.totalBorc.USD || 0) - (stats?.totalOdeme.USD || 0),
                        'USD'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Altın (oz)</span>
                    <span className="font-semibold text-red-600">
                      {(
                        (stats?.totalBorc.Altin || 0) -
                        (stats?.totalOdeme.Altin || 0)
                      ).toFixed(2)}{' '}
                      oz
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card title="Son İşlemler">
              <DataTable
                data={stats?.recentIslemler || []}
                columns={[
                  {
                    key: 'id',
                    label: 'İşlem ID',
                  },
                  {
                    key: 'cari_id',
                    label: 'Müşteri ID',
                  },
                  {
                    key: 'type',
                    label: 'Tür',
                    render: (value) => (
                      <span
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          value === 'borc'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {value === 'borc' ? 'Borç' : 'Ödeme'}
                      </span>
                    ),
                  },
                  {
                    key: 'miktar',
                    label: 'Miktar',
                    render: (value, row) => formatCurrency(value, row.birim),
                  },
                  {
                    key: 'olusturulma_tarihi',
                    label: 'Tarih',
                    render: (value) => formatDate(value),
                  },
                ]}
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
