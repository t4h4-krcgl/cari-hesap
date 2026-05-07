/**
 * Transactions Page
 * Transaction (İşlem) management for borç (debt) and ödeme (payment) operations
 * Includes filtering by customer, date range, currency, and transaction type
 */

import React, { useEffect, useState } from 'react';
import type { Islem, Cari, CreateIslemRequest } from '../types';
import { apiService } from '../services/api';
import {
  Button,
  Input,
  Select,
  Modal,
  Card,
  Spinner,
  EmptyState,
} from '../components/UI';
import { Header, Sidebar, DataTable, SearchBar } from '../components/Layout';
import { formatDate, formatCurrency, getTransactionTypeInfo } from '../utils/helpers';
import { useForm, useNotification, useSelect } from '../hooks/useCommon';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Islem[]>([]);
  const [customers, setCustomers] = useState<Cari[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { value: selectedCustomerId, handleChange: handleCustomerChange } = useSelect<number>(0);
  const setSelectedCustomerId = (val: any) => handleCustomerChange(Number(val));
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCustomerId(e.target.value);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();

  const form = useForm<CreateIslemRequest>({
    type: 'borc',
    miktar: 0,
    birim: 'TL',
    aciklama: '',
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await apiService.cari.list();
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (err) {
      addNotification('Müşteriler yükleme başarısız', 'error');
    }
  };

  // Fetch transactions for selected customer
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      let response;

      if (selectedCustomerId && Number(selectedCustomerId) > 0) {
        response = await apiService.islem.byCari(Number(selectedCustomerId));
      } else {
        response = await apiService.islem.list();
      }

      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch (err) {
      addNotification('İşlemler yükleme başarısız', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch transactions when customer changes
  useEffect(() => {
    fetchTransactions();
  }, [selectedCustomerId]);

  const handleOpenModal = (transaction?: Islem) => {
    if (transaction) {
      setEditingId(transaction.id);
      form.setValues({
        type: transaction.type,
        miktar: transaction.miktar,
        birim: transaction.birim,
        aciklama: transaction.aciklama || '',
      });
    } else {
      setEditingId(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.reset();
  };

  const handleSave = async () => {
    try {
      if (!form.values.miktar || form.values.miktar <= 0) {
        addNotification('Miktar gerekli ve 0 dan büyük olmalı', 'warning');
        return;
      }

      if (!selectedCustomerId || Number(selectedCustomerId) <= 0) {
        addNotification('Müşteri seçiniz', 'warning');
        return;
      }

      if (editingId) {
        // Update
        await apiService.islem.update(editingId, form.values);
        addNotification('İşlem güncellendi', 'success');
      } else {
        // Create
        await apiService.islem.create(Number(selectedCustomerId), form.values);
        addNotification('İşlem oluşturuldu', 'success');
      }

      handleCloseModal();
      fetchTransactions();
    } catch (err: any) {
      addNotification(err?.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu işlem silinsin mi?')) return;

    try {
      await apiService.islem.delete(id);
      addNotification('İşlem silindi', 'success');
      fetchTransactions();
    } catch (err: any) {
      addNotification(err?.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiService.islem.restore(id);
      addNotification('İşlem geri alındı', 'success');
      fetchTransactions();
    } catch (err: any) {
      addNotification(err?.response?.data?.message || 'Geri alma başarısız', 'error');
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.aciklama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.cari_id).includes(searchTerm)
  );

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800">İşlemler</h1>
              <Button
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={!selectedCustomerId || Number(selectedCustomerId) <= 0}
              >
                + Yeni İşlem
              </Button>
            </div>

            {/* Filters */}
            <Card title="Filtreler" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Müşteri Seçin"
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.ad,
                  }))}
                  value={selectedCustomerId}
                  onChange={handleSelectChange}
                />
                <SearchBar
                  onSearch={setSearchTerm}
                  placeholder="Açıklamaya göre ara..."
                />
              </div>
            </Card>

            {/* Transactions Table */}
            <Card>
              {filteredTransactions.length === 0 && transactions.length === 0 ? (
                <EmptyState
                  title="İşlem yok"
                  description={
                    selectedCustomerId && Number(selectedCustomerId) > 0
                      ? 'Bu müşteride hiç işlem yok'
                      : 'İştem görmek için bir müşteri seçin'
                  }
                  action={
                    selectedCustomerId && Number(selectedCustomerId) > 0 && (
                      <Button variant="primary" onClick={() => handleOpenModal()}>
                        İlk İşlemi Ekleyin
                      </Button>
                    )
                  }
                />
              ) : (
                <DataTable
                  data={filteredTransactions}
                  columns={[
                    { key: 'id', label: 'İşlem ID' },
                    { key: 'cari_id', label: 'Müşteri ID' },
                    {
                      key: 'type',
                      label: 'Tür',
                      render: (value) => {
                        const info = getTransactionTypeInfo(value);
                        return (
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              value === 'borc'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {info.label}
                          </span>
                        );
                      },
                    },
                    {
                      key: 'miktar',
                      label: 'Miktar',
                      render: (value, row) => formatCurrency(value, row.birim),
                    },
                    {
                      key: 'birim',
                      label: 'Birim',
                    },
                    {
                      key: 'aciklama',
                      label: 'Açıklama',
                      render: (value) => value || '—',
                    },
                    {
                      key: 'olusturulma_tarihi',
                      label: 'Tarih',
                      render: (value) => formatDate(value),
                    },
                  ]}
                  actions={(transaction) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenModal(transaction)}
                      >
                        ✏️ Düzenle
                      </Button>
                      {!transaction.deleted_at && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          🗑️ Sil
                        </Button>
                      )}
                      {transaction.deleted_at && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleRestore(transaction.id)}
                        >
                          ↺ Geri Al
                        </Button>
                      )}
                    </div>
                  )}
                />
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'İşlem Düzenle' : 'Yeni İşlem'}
        onClose={handleCloseModal}
        actions={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              İptal
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="İşlem Türü *"
            options={[
              { value: 'borc', label: 'Borç' },
              { value: 'odeme', label: 'Ödeme' },
            ]}
            name="type"
            value={form.values.type}
            onChange={form.handleChange}
          />
          <Input
            label="Miktar *"
            type="number"
            name="miktar"
            placeholder="0.00"
            step="0.01"
            value={form.values.miktar}
            onChange={form.handleChange}
          />
          <Select
            label="Birim *"
            options={[
              { value: 'TL', label: 'TL (Türk Lirası)' },
              { value: 'USD', label: 'USD (Amerikan Doları)' },
              { value: 'Altin', label: 'Altın (Gram)' },
            ]}
            name="birim"
            value={form.values.birim}
            onChange={form.handleChange}
          />
          <Input
            label="Açıklama"
            type="text"
            name="aciklama"
            placeholder="İşlem açıklaması (opsiyonel)"
            value={form.values.aciklama}
            onChange={form.handleChange}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
