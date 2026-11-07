'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button as AntButton,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
} from 'antd';
import {
  Users,
  Search,
  Plus,
  Upload,
  Phone,
  Mail,
  Building,
  Clock,
  Gift,
  Coins,
  Send,
  MessageCircle,
  ExternalLink,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { formatIndianCurrency } from '@ginie/i18n';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomerTimelineDrawer from '@/components/CustomerTimelineDrawer';
import CustomerImportModal from '@/components/CustomerImportModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AppButton, AppEmpty } from '@/components/common';

interface LoyaltyData {
  points: number;
  cashback: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
}

function CustomersContent() {
  const { t, brandColor } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') === 'companies' ? 'companies' : 'people';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Loyalty Points state
  const [loyaltyMap, setLoyaltyMap] = useState<Record<string, LoyaltyData>>({});
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [selectedLoyaltyContact, setSelectedLoyaltyContact] = useState<any | null>(null);
  const [giftForm] = Form.useForm();

  // Modals & Drawers state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // In-App Quick WhatsApp Chat Modal state
  const [quickWaModalOpen, setQuickWaModalOpen] = useState(false);
  const [quickWaContact, setQuickWaContact] = useState<any | null>(null);
  const [quickWaText, setQuickWaText] = useState('');
  const [sendingQuickWa, setSendingQuickWa] = useState(false);

  const handleOpenQuickWhatsApp = (contact: any) => {
    setQuickWaContact(contact);
    const greetingName = contact.name ? ` ${contact.name}` : '';
    setQuickWaText(`Namaste${greetingName} ji, `);
    setQuickWaModalOpen(true);
  };

  const handleSendQuickWhatsApp = async () => {
    if (!quickWaContact || !quickWaText.trim()) {
      message.error('Please enter a message to send.');
      return;
    }
    const cleanDigits = (quickWaContact.phone || '').replace(/\D/g, '');
    const cleanPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

    setSendingQuickWa(true);
    try {
      await api.post('/api/whatsapp/messages', {
        phone: cleanPhone,
        message: quickWaText.trim(),
        contactId: quickWaContact.id,
      });
      message.success(`WhatsApp message delivered to ${quickWaContact.name || 'customer'}!`);
      setQuickWaModalOpen(false);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'WhatsApp sending failed. Ensure WhatsApp is paired in Settings.');
    } finally {
      setSendingQuickWa(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        api.get('/api/contacts'),
        api.get('/api/companies'),
      ]);
      const loadedContacts = contactsRes || [];
      setContacts(loadedContacts);
      setCompanies(companiesRes || []);

      // Calculate real customer loyalty points directly from PostgreSQL database
      const realLoyaltyMap: Record<string, LoyaltyData> = {};
      loadedContacts.forEach((c: any) => {
        const pts = Number(c.loyaltyPoints) || 0;
        const tier = pts >= 500 ? 'Platinum' : pts >= 200 ? 'Gold' : 'Silver';
        realLoyaltyMap[c.id] = {
          points: pts,
          cashback: Math.round(pts * 0.5),
          tier,
        };
      });
      setLoyaltyMap(realLoyaltyMap);
    } catch (err: any) {
      message.error(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGiftModal = (contact: any) => {
    setSelectedLoyaltyContact(contact);
    const existing = loyaltyMap[contact.id] || { points: Number(contact.loyaltyPoints) || 0, cashback: 0, tier: 'Silver' };
    giftForm.setFieldsValue({
      points: 100,
      reason: 'Festive Bonus / Loyalty Appreciation',
      tier: existing.tier,
    });
    setGiftModalOpen(true);
  };

  const handleSaveLoyaltyGift = async (values: any) => {
    if (!selectedLoyaltyContact) return;
    const existing = loyaltyMap[selectedLoyaltyContact.id] || { points: 0, cashback: 0, tier: 'Silver' };
    const addedPoints = Number(values.points || 0);
    const newTotal = existing.points + addedPoints;
    let newTier = values.tier || existing.tier;
    if (newTotal > 750) newTier = 'Platinum';
    else if (newTotal > 350) newTier = 'Gold';

    try {
      // Persist loyalty points to PostgreSQL database
      await api.post(`/api/contacts/${selectedLoyaltyContact.id}/loyalty`, {
        pointsDelta: addedPoints,
        reason: values.reason || 'Loyalty Points Gift',
      });

      const updated = {
        ...loyaltyMap,
        [selectedLoyaltyContact.id]: {
          points: newTotal,
          cashback: Math.round(newTotal * 0.5),
          tier: newTier,
        },
      };

      setLoyaltyMap(updated);
      message.success(`Added ${addedPoints} loyalty points to ${selectedLoyaltyContact.name}!`);
      setGiftModalOpen(false);
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to update loyalty points in database.');
      return;
    }

    // Optional WhatsApp celebration dispatch
    if (selectedLoyaltyContact.phone) {
      const cleanPhone = selectedLoyaltyContact.phone.replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const text =
        `*Dear ${selectedLoyaltyContact.name},*\n\n` +
        `Congratulations! You have received *${addedPoints} Bonus Loyalty Points* (₹${addedPoints}) in your GINIE wallet.\n` +
        `Total Wallet Balance: *${newTotal} Points* (${newTier} Member).\n` +
        `Redeem this on your next billing or order!\n\n` +
        `Thank you for being our valued customer.`;
      
      api.post('/api/whatsapp/messages', {
        phone: waPhone,
        message: text,
        contactId: selectedLoyaltyContact.id,
      }).then(() => {
        message.success('Celebratory WhatsApp notification delivered to customer!');
      }).catch(() => {
        message.info('Points credited! WhatsApp delivery pending session connection.');
      });
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const values = await addForm.validateFields();
      setSubmittingAdd(true);
      await api.post('/api/contacts', values);
      message.success('Customer added successfully!');
      setAddCustomerOpen(false);
      addForm.resetFields();
      loadData();
    } catch (err: any) {
      message.error(err.message || 'Failed to create customer');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.company?.name && c.company.name.toLowerCase().includes(q))
    );
  });

  const filteredCompanies = companies.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.industry && c.industry.toLowerCase().includes(q))
    );
  });

  const totalPointsInSystem = Object.values(loyaltyMap).reduce((sum, item) => sum + (item.points || 0), 0);

  const contactColumns = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div
          className="flex items-center gap-3 cursor-pointer group py-1"
          onClick={() => {
            setSelectedCustomerId(record.id);
            setTimelineDrawerOpen(true);
          }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-sm">
            {(name || 'C').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              {name}
            </div>
            {record.designation ? (
              <div className="text-xs text-slate-500 font-medium">
                {record.designation}
              </div>
            ) : (
              <div className="text-xs text-slate-400">Customer</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Loyalty Points & Wallet',
      key: 'loyalty',
      render: (_: any, record: any) => {
        const pts = Number(record.loyaltyPoints) || 0;
        const tier = pts >= 500 ? 'Platinum' : pts >= 200 ? 'Gold' : 'Silver';
        const data = loyaltyMap[record.id] || { points: pts, cashback: Math.round(pts * 0.5), tier };
        const tierBadgeVariant = data.tier === 'Platinum' ? 'purple' : data.tier === 'Gold' ? 'warning' : 'secondary';
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={tierBadgeVariant as any} className="font-bold text-[11px] px-2 py-0.5">
                {data.tier}
              </Badge>
              <span className="font-bold text-xs text-emerald-600 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {data.points} pts
              </span>
            </div>
            <div>
              <button
                onClick={() => handleOpenGiftModal(record)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 hover:underline"
              >
                + Gift Points / Tier
              </button>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (comp: any) =>
        comp?.name ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{comp.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: 'Phone & Quick Connect',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string, record: any) => {
        if (!phone) return <span className="text-xs text-slate-400">—</span>;
        return (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-700">{phone}</span>
            <a
              href={`tel:${phone}`}
              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
              title="Direct Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => handleOpenQuickWhatsApp(record)}
              className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors shadow-xs"
              title="Send WhatsApp in CRM"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) =>
        email ? (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{email}</span>
          </a>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: 'Timeline (360°)',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-semibold h-8 bg-white hover:bg-slate-50 text-slate-700"
          onClick={() => {
            setSelectedCustomerId(record.id);
            setTimelineDrawerOpen(true);
          }}
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" /> Activity Stream
        </Button>
      ),
    },
  ];

  const companyColumns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      render: (ind: string) =>
        ind ? (
          <Badge variant="secondary" className="font-semibold text-xs">
            {ind}
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: 'City / Location',
      dataIndex: 'city',
      key: 'city',
      render: (city: string, record: any) =>
        city || record.customFields?.city ? (
          <span className="text-xs font-medium text-slate-700">
            {city || record.customFields?.city}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: 'Key Contacts',
      dataIndex: 'contacts',
      key: 'contacts',
      render: (conts: any[]) =>
        conts && conts.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {conts.map((c: any, i: number) => (
              <Badge key={i} variant="outline" className="text-xs bg-slate-50">
                {c.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">0 contacts</span>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <span>Customers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage all client contacts, customer cashback wallets, and 360° chronological activity timelines.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setImportModalOpen(true)}
            className="gap-2 font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate-500" /> Import Excel / CSV
          </Button>

          <Button
            variant="gradient"
            onClick={() => setAddCustomerOpen(true)}
            className="gap-2 font-semibold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> + Customer Jodein
          </Button>
        </div>
      </div>

      {/* Modern Loyalty & Retention Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {contacts.length}
            </div>
            <div className="mt-1 text-xs text-blue-600 font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> All registered client accounts
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Loyalty Points
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-600">
              {totalPointsInSystem} <span className="text-sm font-bold text-slate-400">Pts</span>
            </div>
            <div className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Circulating in customer wallets
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Redeemable Cashback
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-purple-600">
              {formatIndianCurrency(totalPointsInSystem)}
            </div>
            <div className="mt-1 text-xs text-purple-600 font-semibold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> Ready for counter bill redemption
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container with Modern Tabs and Search Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Controls Bar: Segmented Tab Pills + Modern Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Segmented Tab Buttons */}
          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-xl self-start">
            <button
              onClick={() => {
                setActiveTab('people');
                router.push('/customers?tab=people');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'people'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>People & Contacts</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'people'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {filteredContacts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('companies');
                router.push('/customers?tab=companies');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'companies'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Companies & Accounts</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'companies'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {filteredCompanies.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search name, phone, email, firm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200/90 focus:bg-white text-xs sm:text-sm rounded-xl"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="p-2 sm:p-4">
          {activeTab === 'people' ? (
            <>
              <div className="hidden md:block overflow-x-auto">
            <Table
              dataSource={filteredContacts}
              columns={contactColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 750 }}
              locale={{
                emptyText: (
                  <AppEmpty
                    description="Koi customer nahi mila. Pehla customer jodein!"
                    actionLabel="+ Customer Jodein"
                    onAction={() => setAddCustomerOpen(true)}
                  />
                ),
              }}
              className="ginie-modern-table"
            />
          </div>

          {/* Mobile Card Stack */}
          <div className="block md:hidden space-y-3">
            {filteredContacts.length === 0 && !loading ? (
              <AppEmpty
                description="Koi customer nahi mila. Pehla customer jodein!"
                actionLabel="+ Customer Jodein"
                onAction={() => setAddCustomerOpen(true)}
              />
            ) : (
              filteredContacts.map((c) => {
                const pts = Number(c.loyaltyPoints) || 0;
                const tier = pts >= 500 ? 'Platinum' : pts >= 200 ? 'Gold' : 'Silver';
                const data = loyaltyMap[c.id] || { points: pts, cashback: Math.round(pts * 0.5), tier };
                const tierBadgeVariant = data.tier === 'Platinum' ? 'purple' : data.tier === 'Gold' ? 'warning' : 'secondary';

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setTimelineDrawerOpen(true);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {(c.name || 'C').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-900 truncate">{c.name}</div>
                          {c.company?.name && (
                            <div className="text-xs text-slate-500 font-medium truncate">{c.company.name}</div>
                          )}
                        </div>
                      </div>

                      <Badge variant={tierBadgeVariant as any} className="text-[10px] font-bold shrink-0">
                        {data.tier} • {data.points} pts
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {c.phone ? (
                          <>
                            <span className="font-medium text-slate-700">{c.phone}</span>
                            <a
                              href={`tel:${c.phone}`}
                              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleOpenQuickWhatsApp(c)}
                              className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400">No phone</span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setTimelineDrawerOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5" /> Timeline
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
          ) : (
            <Table
              dataSource={filteredCompanies}
              columns={companyColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 650 }}
              className="ginie-modern-table"
            />
          )}
        </div>
      </div>

      {/* Gift Loyalty Points Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Gift className="w-5 h-5 text-emerald-600" />
            <span>Credit Loyalty Points & Cashback Wallet</span>
          </div>
        }
        open={giftModalOpen}
        onCancel={() => setGiftModalOpen(false)}
        onOk={() => giftForm.submit()}
        okText="Credit Points to Customer"
      >
        {selectedLoyaltyContact && (
          <div className="pt-2">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 mb-4">
              <div className="font-bold text-slate-900 text-sm">{selectedLoyaltyContact.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Phone: {selectedLoyaltyContact.phone || 'N/A'} &bull; Current Points: {loyaltyMap[selectedLoyaltyContact.id]?.points || 0}
              </div>
            </div>

            <Form form={giftForm} layout="vertical" onFinish={handleSaveLoyaltyGift}>
              <Form.Item
                name="points"
                label="Points to Credit (1 pt = ₹1 discount)"
                rules={[{ required: true, message: 'Please enter points' }]}
              >
                <InputNumber style={{ width: '100%' }} min={10} max={10000} step={50} />
              </Form.Item>

              <Form.Item name="tier" label="Membership Tier">
                <Select
                  options={[
                    { label: 'Silver Member', value: 'Silver' },
                    { label: 'Gold Member', value: 'Gold' },
                    { label: 'Platinum VIP Member', value: 'Platinum' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="reason" label="Reason / Campaign">
                <Input placeholder="e.g. Festival Gift, Review Reward, Order Bonus" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* In-App Quick WhatsApp Chat Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>Send WhatsApp &bull; {quickWaContact?.name || 'Customer'}</span>
          </div>
        }
        open={quickWaModalOpen}
        onCancel={() => setQuickWaModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <div className="pt-2 space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
            <span className="text-slate-600">
              To: <strong className="text-slate-900">+91 {(quickWaContact?.phone || '').replace(/\D/g, '').slice(-10)}</strong>
            </span>
            <Badge variant="success" className="text-[10px]">Direct In-App Delivery</Badge>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Quick Templates:
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="Choose a template..."
              onChange={(val) => {
                const name = quickWaContact?.name || 'ji';
                if (val === 'payment') {
                  setQuickWaText(`Namaste ${name} ji, this is a gentle follow-up regarding your pending payment. Please let us know if you need any assistance with payment details. Thank you!`);
                } else if (val === 'greeting') {
                  setQuickWaText(`Namaste ${name} ji, hope you are having a productive week! Please let us know if you need any assistance with our products or services.`);
                } else if (val === 'quote') {
                  setQuickWaText(`Namaste ${name} ji, did you get a chance to review our quotation? Happy to adjust according to your requirements.`);
                } else if (val === 'catalog') {
                  setQuickWaText(`Namaste ${name} ji, check out our latest digital storefront products here: https://ginie.space/store/catalog . Feel free to place orders directly!`);
                }
              }}
              options={[
                { label: 'General Relationship Check-in', value: 'greeting' },
                { label: 'Payment Follow-up / Reminder', value: 'payment' },
                { label: 'Quotation Follow-up', value: 'quote' },
                { label: 'Share Storefront Catalog Link', value: 'catalog' },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Message Text:
            </label>
            <textarea
              rows={4}
              value={quickWaText}
              onChange={(e) => setQuickWaText(e.target.value)}
              placeholder="Type your WhatsApp message..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                const cleanDigits = (quickWaContact?.phone || '').replace(/\D/g, '');
                const clean = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
                setQuickWaModalOpen(false);
                router.push(`/whatsapp?phone=${clean}`);
              }}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Open in WhatsApp Inbox &rarr;
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuickWaModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                disabled={sendingQuickWa}
                onClick={handleSendQuickWhatsApp}
                className="gap-1.5 shadow-sm font-bold"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingQuickWa ? 'Sending...' : 'Send via WhatsApp'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Customer 360 Timeline Drawer */}
      <CustomerTimelineDrawer
        customerId={selectedCustomerId}
        open={timelineDrawerOpen}
        onClose={() => {
          setTimelineDrawerOpen(false);
          setSelectedCustomerId(null);
        }}
      />

      {/* Import Customers Modal */}
      <CustomerImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => loadData()}
      />

      {/* Add Customer Modal */}
      <Modal
        title="Naya Customer Jodein"
        open={addCustomerOpen}
        onCancel={() => setAddCustomerOpen(false)}
        onOk={handleCreateCustomer}
        confirmLoading={submittingAdd}
        okText="Save Karein"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="e.g. Ramesh Patel" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number (+91)">
            <Input placeholder="e.g. +91 98201 11223 or 9820111223" />
          </Form.Item>

          <Form.Item name="email" label="Email Address">
            <Input placeholder="e.g. ramesh@example.com" />
          </Form.Item>

          <Form.Item name="companyName" label="Company / Business Name">
            <Input placeholder="e.g. Patel Engineering" />
          </Form.Item>

          <Form.Item name="designation" label="Designation / Role">
            <Input placeholder="e.g. Managing Director, Purchase Manager" />
          </Form.Item>

          <Form.Item name="notes" label="Initial Notes">
            <textarea
              rows={3}
              placeholder="Any notes from call or meeting..."
              className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading customers...</div>}>
      <CustomersContent />
    </React.Suspense>
  );
}
