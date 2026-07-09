import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Calendar, User, Tag, Eye, Send, Clock, CheckCircle2, AlertTriangle, XCircle, Download, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import StatCard from './ds/StatCard';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  title: string;
  type: string;
  from: string;
  date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}

interface OutboxPageProps {
  onViewDetails: (transactionId: string) => void;
  transactions?: Transaction[];
}

const sampleTransactions: Transaction[] = [
  {
    id: '2024-001',
    title: 'طلب إجازة سنوية - أحمد محمد',
    type: 'إجازة سنوية',
    from: 'قسم الموارد البشرية',
    date: '2024-10-15',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: '2024-002',
    title: 'طلب صرف مستحقات - فاطمة علي',
    type: 'مالية',
    from: 'قسم الحسابات',
    date: '2024-10-14',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2024-003',
    title: 'شهادة راتب - محمد عبدالله',
    type: 'شهادة',
    from: 'قسم الموارد البشرية',
    date: '2024-10-13',
    status: 'completed',
    priority: 'low'
  },
  {
    id: '2024-004',
    title: 'طلب ترقية - سارة أحمد',
    type: 'موارد بشرية',
    from: 'قسم التطوير',
    date: '2024-10-12',
    status: 'in-progress',
    priority: 'high'
  },
  {
    id: '2024-005',
    title: 'طلب تعديل بيانات - خالد محمد',
    type: 'إدارية',
    from: 'قسم شؤون الموظفين',
    date: '2024-10-11',
    status: 'rejected',
    priority: 'medium'
  },
  {
    id: '2024-006',
    title: 'طلب بدل مواصلات - أحمد محمد السالم',
    type: 'بدل مواصلات',
    from: 'قسم تقنية المعلومات',
    date: new Date().toISOString().split('T')[0],
    status: 'in-progress',
    priority: 'medium'
  }
];

const OutboxPage: React.FC<OutboxPageProps> = ({ onViewDetails, transactions: propTransactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>(propTransactions || sampleTransactions);

  useEffect(() => {
    if (!propTransactions) {
      loadTransactions();
    } else {
      setTransactions(propTransactions);
    }
  }, [propTransactions]);

  const loadTransactions = async () => {
    try {
      // محاولة تحميل من localStorage أولاً
      const storedTransactions = localStorage.getItem('outbox_transactions');
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        setTransactions([...sampleTransactions, ...parsed]);
        return;
      }

      // محاولة تحميل من Supabase
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('current_location', 'صادر')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Using sample data due to error:', error.message);
        setTransactions(sampleTransactions);
      } else if (data) {
        const formattedTransactions: Transaction[] = data.map(t => ({
          id: t.transaction_number,
          title: t.title,
          type: t.transaction_type,
          from: t.department,
          date: new Date(t.created_at).toLocaleDateString('en-US'),
          status: t.status === 'قيد المعالجة' ? 'in-progress' : t.status === 'منتهية' ? 'completed' : t.status === 'مرفوضة' ? 'rejected' : 'pending',
          priority: t.priority === 'عاجل' ? 'high' : t.priority === 'متوسط' ? 'medium' : 'low'
        }));
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions(sampleTransactions);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
            <CheckCircle2 className="me-1 h-3 w-3 sm:h-4 sm:w-4" /> مكتملة
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/30">
            <Clock className="me-1 h-3 w-3 sm:h-4 sm:w-4" /> قيد المعالجة
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/30">
            <AlertTriangle className="me-1 h-3 w-3 sm:h-4 sm:w-4" /> معلقة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/30">
            <XCircle className="me-1 h-3 w-3 sm:h-4 sm:w-4" /> مرفوضة
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-900/50 border text-xs">عاجل</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50 border text-xs">متوسط</Badge>;
      case 'low':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900/50 border text-xs">عادي</Badge>;
      default:
        return null;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.title.includes(searchQuery) ||
        transaction.id.includes(searchQuery) ||
        transaction.from.includes(searchQuery);
      const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: transactions.length,
      pending: transactions.filter((t) => t.status === 'pending').length,
      completed: transactions.filter((t) => t.status === 'completed').length,
      rejected: transactions.filter((t) => t.status === 'rejected').length,
      urgent: transactions.filter((t) => t.priority === 'high').length,
    };
  }, [transactions]);

  return (
    <div
      dir="rtl"
      className="min-h-screen"
    >
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6"
        >
          <StatCard title="الصادرة" value={`${filteredTransactions.length}`} sub="معاملة صادرة" icon={Send} />
          <StatCard title="إجمالي المعاملات" value={`${stats.total}`} icon={FileText} />
          <StatCard title="قيد الانتظار" value={`${stats.pending}`} icon={Clock} />
          <StatCard title="مكتملة" value={`${stats.completed}`} icon={CheckCircle2} />
          <StatCard title="مرفوضة" value={`${stats.rejected}`} icon={XCircle} />
          <StatCard title="عاجلة" value={`${stats.urgent}`} icon={AlertTriangle} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن معاملة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9 pl-4 w-full sm:w-64 rounded-2xl text-sm dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44 rounded-2xl text-sm dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200">
                <SelectValue placeholder="حالة المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلقة</SelectItem>
                <SelectItem value="in-progress">قيد المعالجة</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="rejected">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-2xl text-xs sm:text-sm dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700">
              <Download className="me-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              تصدير
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl text-xs sm:text-sm dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700">
              <Printer className="me-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              طباعة
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Card className="rounded-2xl border dark:border-neutral-700 shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-800/80 dark:supports-[backdrop-filter]:bg-neutral-800/60">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">رقم المعاملة</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">العنوان</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">النوع</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">من</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">التاريخ</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">الأولوية</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">الحالة</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-neutral-600 dark:text-neutral-400">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-neutral-100 dark:border-neutral-700/60 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-100">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-neutral-100 dark:bg-neutral-700 p-1.5 rounded-lg">
                              <FileText className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                            </div>
                            <span className="font-medium text-sm text-neutral-800 dark:text-neutral-100">{transaction.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600 text-xs">
                            <Tag className="w-3 h-3 me-1" />
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 text-sm">
                            <User className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                            <span>{transaction.from}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                            <span>{transaction.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getPriorityBadge(transaction.priority)}</td>
                        <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(transaction.id)}
                            className="rounded-xl hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white text-xs h-8"
                          >
                            <Eye className="w-3.5 h-3.5 me-1" />
                            عرض
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-neutral-100 dark:divide-neutral-700">
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-100 dark:bg-neutral-700 p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                        </div>
                        <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-100">{transaction.id}</span>
                      </div>
                      <div className="flex gap-2">{getPriorityBadge(transaction.priority)}</div>
                    </div>

                    <h3 className="font-bold text-neutral-800 dark:text-neutral-100 mb-2 text-sm leading-tight">{transaction.title}</h3>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                        <span>{transaction.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <User className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                        <span>{transaction.from}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <Calendar className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                        <span>{transaction.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {getStatusBadge(transaction.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(transaction.id)}
                        className="rounded-xl hover:bg-neutral-100 hover:text-neutral-900 hover:border-neutral-300 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white text-xs h-8"
                      >
                        <Eye className="w-3 h-3 me-1" />
                        عرض
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-lg">لا توجد معاملات مطابقة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OutboxPage;
