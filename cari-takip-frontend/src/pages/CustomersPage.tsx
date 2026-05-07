/**
 * Customers Page
 * Customer (Cari) management with CRUD operations and soft delete
 */

import React, { useEffect, useState } from 'react';
import type { Cari, CreateCariRequest } from '../types';
import { apiService } from '../services/api';
import {
  Button,
  Input,
  Modal,
  Card,
  Spinner,
  EmptyState,
} from '../components/UI';
import { Header, Sidebar, DataTable, SearchBar, Pagination } from '../components/Layout';
import { truncate } from '../utils/helpers';
import { useForm, useNotification, usePagination } from '../hooks/useCommon';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Cari[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Cari[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotification();
  const { page, setTotal, goToPage } = usePagination(1, 10);

  const form = useForm<CreateCariRequest>({
    ad: '',
    email: '',
    telefon: '',
    adres: '',
    kredi_limiti: 0,
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.cari.list();
      if (response.success && response.data) {
        setCustomers(response.data);
        setTotal(response.data.length);
      }
    } catch (err) {
      addNotification('Müşteriler yükleme başarısız', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(
      filtered.slice((page - 1) * 10, page * 10)
    );
  }, [customers, searchTerm, page]);

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (customer?: Cari) => {
    if (customer) {
      setEditingId(customer.id);
      form.setValues({
        ad: customer.ad,
        email: customer.email || '',
        telefon: customer.telefon || '',
        adres: customer.adres || '',
        kredi_limiti: customer.kredi_limiti,
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
      if (!form.values.ad.trim()) {
        addNotification('Müşteri adı gereklidir', 'warning');
        return;
      }

      if (editingId) {
        // Update
        await apiService.cari.update(editingId, form.values);
        addNotification('Müşteri güncellendi', 'success');
      } else {
        // Create
        await apiService.cari.create(form.values);
        addNotification('Müşteri oluşturuldu', 'success');
      }

      handleCloseModal();
      fetchCustomers();
    } catch (err: any) {
      addNotification(err?.response?.data?.message || 'İşlem başarısız', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu müşteri silinsin mi?')) return;

    try {
      await apiService.cari.delete(id);
      addNotification('Müşteri silindi', 'success');
      fetchCustomers();
    } catch (err: any) {
      addNotification(err?.response?.data?.message || 'Silme başarısız', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiService.cari.restore(id);
      addNotification('Müşteri geri alındı', 'success');
      fetchCustomers();
    } catch (err: any) {
      addNotification(err?.response?.data?.message || 'Geri alma başarısız', 'error');
    }
  };

  // Handle delete and restore
  const handleActionClick = (id: number, action: 'delete' | 'restore') => {
    if (action === 'delete') handleDelete(id);
    else if (action === 'restore') handleRestore(id);
  };

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
              <h1 className="text-3xl font-bold text-gray-800">Müşteriler</h1>
              <Button
                variant="primary"
                onClick={() => handleOpenModal()}
              >
                + Yeni Müşteri
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Müşteri adı veya email'e göre ara..."
              />
            </div>

            {/* Customers Table */}
            <Card>
              {filteredCustomers.length === 0 && customers.length === 0 ? (
                <EmptyState
                  title="Müşteri yok"
                  description="Henüz hiç müşteri eklenmemiş"
                  action={
                    <Button variant="primary" onClick={() => handleOpenModal()}>
                      İlk Müşterinizi Ekleyin
                    </Button>
                  }
                />
              ) : (
                <>
                  <DataTable
                    data={filteredCustomers}
                    columns={[
                      { key: 'ad', label: 'Adı' },
                      {
                        key: 'email',
                        label: 'Email',
                        render: (value) => truncate(value || 'N/A', 30),
                      },
                      { key: 'telefon', label: 'Telefon' },
                      {
                        key: 'kredi_limiti',
                        label: 'Kredi Limiti',
                        render: (value) => `₺${value.toFixed(2)}`,
                      },
                      {
                        key: 'gecerli_borc',
                        label: 'Güncel Borç',
                        render: (value) => (
                          <span className="text-red-600 font-semibold">
                            ₺{value.toFixed(2)}
                          </span>
                        ),
                      },
                      {
                        key: 'durum',
                        label: 'Durum',
                        render: (value) => (
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              value === 'aktif'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {value}
                          </span>
                        ),
                      },
                    ]}
                    actions={(customer) => (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenModal(customer)}
                        >
                          ✏️ Düzenle
                        </Button>
                        {!customer.deleted_at && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleActionClick(customer.id, 'delete')}
                          >
                            🗑️ Sil
                          </Button>
                        )}
                        {customer.deleted_at && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleActionClick(customer.id, 'restore')}
                          >
                            ↺ Geri Al
                          </Button>
                        )}
                      </div>
                    )}
                  />

                  {/* Pagination */}
                  <Pagination
                    page={page}
                    totalPages={Math.ceil(customers.length / 10)}
                    onPageChange={goToPage}
                  />
                </>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
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
          <Input
            label="Müşteri Adı *"
            name="ad"
            placeholder="Müşteri adını girin"
            value={form.values.ad}
            onChange={form.handleChange}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="email@example.com"
            value={form.values.email}
            onChange={form.handleChange}
          />
          <Input
            label="Telefon"
            name="telefon"
            placeholder="+90 500 000 00 00"
            value={form.values.telefon}
            onChange={form.handleChange}
          />
          <Input
            label="Adres"
            name="adres"
            placeholder="Müşteri adresi"
            value={form.values.adres}
            onChange={form.handleChange}
          />
          <Input
            label="Kredi Limiti (TL)"
            type="number"
            name="kredi_limiti"
            placeholder="0.00"
            step="0.01"
            value={form.values.kredi_limiti}
            onChange={form.handleChange}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;
