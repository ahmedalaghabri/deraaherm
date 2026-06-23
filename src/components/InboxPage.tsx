import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Calendar, User, Tag, Eye, Inbox, Clock, CheckCircle2, AlertTriangle, XCircle, Info, Download, Printer, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '../lib/utils';
import TransactionReplyModal from './TransactionReplyModal';
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

interface InboxPageProps {
  onViewDetails: (transactionId: string) => void;
  transactions?: Transaction[];
  onTransactionUpdate?: () => void;
}

const sampleTransactions: Transaction[] = [
  {
    id: '2024-006',
    title: 'موافقة على طلب إجازة - سالم أحمد',
    type: 'إجازة سنوية',
    from: 'إدارة الموارد البشرية',
    date: '2024-10-16',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2024-007',
    title: 'طلب مراجعة شهادة راتب - نورة محمد',
    type: 'شهادة',
    from: 'إدارة المالية',
    date: '2024-10-15',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: '2024-008',
    title: 'اعتماد ترقية موظف - عبدالله خالد',
    type: 'موارد بشرية',
    from: 'إدارة التطوير',
    date: '2024-10-14',
    status: 'completed',
    priority: 'high'
  },
  {
    id: '2024-009',
    title: 'موافقة على طلب تدريب - ريم سعيد',
    type: 'تدريب',
    from: 'إدارة التدريب',
    date: '2024-10-13',
    status: 'in-progress',
    priority: 'low'
  },
  {
    id: '2024-010',
    title: 'مراجعة طلب نقل - محمد عمر',
    type: 'إدارية',
    from: 'إدارة شؤون الموظفين',
    date: '2024-10-12',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '2024-011',
    title: 'طلب بدل مواصلات - خالد أحمد',
    type: 'بدل مواصلات',
    from: 'قسم المبيعات',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    priority: 'medium'
  }
];

function toneClasses(tone: 'sky' | 'rose' | 'violet' | 'emerald' | 'amber') {
  const map = {
    sky: {
      card: 'bg-white border-sky-100',
      iconWrap: 'bg-sky-100/60 text-sky-700 border-sky-200',
    },
    rose: {
      card: 'bg-white border-rose-100',
      iconWrap: 'bg-rose-100/60 text-rose-700 border-rose-200',
    },
    violet: {
      card: 'bg-white border-violet-100',
      iconWrap: 'bg-violet-100/60 text-violet-700 border-violet-200',
    },
    emerald: {
      card: 'bg-white border-emerald-100',
      iconWrap: 'bg-emerald-100/60 text-emerald-700 border-emerald-200',
    },
    amber: {
      card: 'bg-white border-amber-100',
      iconWrap: 'bg-amber-100/60 text-amber-700 border-amber-200',
    },
  } as const;
  return map[tone];
}

function StatCard({ title, value, icon: Icon, tone = 'sky' }: { title: string; value: string; icon: React.ElementType; tone?: 'sky' | 'rose' | 'violet' | 'emerald' | 'amber' }) {
  const t = toneClasses(tone);
  return (
    <Card className={cn('rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md', t.card)}>
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={cn('grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl border', t.iconWrap)}>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="text-lg sm:text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

const InboxPage: React.FC<InboxPageProps> = ({ onViewDetails, transactions: propTransactions, onTransactionUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>(propTransactions || sampleTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propTransactions) {
      loadTransactions();
    } else {
      setTransactions(propTransactions);
    }
  }, [propTransactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('current_location', 'وارد')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async (replyData: {
    action: string;
    comments: string;
    attachments: File[];
    requiresInvoice?: boolean;
  }) => {
    if (!selectedTransaction) return;

    try {
      setLoading(true);

      const actionMap: Record<string, string> = {
        approve: 'موافقة',
        return_for_invoice: 'إعادة لرفع فاتورة',
        reject: 'رفض'
      };

      const statusMap: Record<string, string> = {
        approve: 'تم',
        return_for_invoice: 'تم',
        reject: 'مرفوض'
      };

      const { error: workflowError } = await supabase
        .from('transaction_workflow')
        .insert({
          transaction_id: selectedTransaction.id,
          step_number: 1,
          handler_name: 'الموظف المستلم',
          handler_role: 'مستلم',
          action: actionMap[replyData.action],
          comments: replyData.comments,
          status: statusMap[replyData.action]
        });

      if (workflowError) throw workflowError;

      let newLocation = 'صادر';
      let newStatus = 'قيد المعالجة';

      if (replyData.action === 'return_for_invoice') {
        newLocation = 'صادر';
        newStatus = 'قيد المعالجة';
      } else if (replyData.action === 'reject') {
        newLocation = 'صادر';
        newStatus = 'مرفوضة';
      } else if (replyData.action === 'approve') {
        newLocation = 'صادر';
        newStatus = 'منتهية';
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          current_location: newLocation,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_number', selectedTransaction.id);

      if (updateError) throw updateError;

      setIsReplyModalOpen(false);
      setSelectedTransaction(null);

      if (onTransactionUpdate) {
        onTransactionUpdate();
      } else {
        await loadTransactions();
      }

      alert('تم إرسال الرد بنجاح');
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('حدث خطأ أثناء إرسال الرد');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="rounded-full" variant="secondary">
            <CheckCircle2 className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> مكتملة
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="rounded-full bg-green-100 text-green-900 hover:bg-green-100">
            <Clock className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> قيد المعالجة
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">
            <AlertTriangle className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> معلقة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100">
            <XCircle className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> مرفوضة
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700 border-red-300 border text-xs">عاجل</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300 border text-xs">متوسط</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700 border-green-300 border text-xs">عادي</Badge>;
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
      inProgress: transactions.filter((t) => t.status === 'in-progress').length,
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
          <Card className="rounded-2xl border bg-white border-green-100 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-green-100/60 text-green-700 border border-green-200 shrink-0">
                  <Inbox className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">الواردة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold text-green-700">{filteredTransactions.length}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">معاملة واردة</p>
            </CardContent>
          </Card>
          <StatCard title="إجمالي المعاملات" value={`${stats.total}`} icon={FileText} tone="sky" />
          <StatCard title="قيد الانتظار" value={`${stats.pending}`} icon={Clock} tone="amber" />
          <StatCard title="مكتملة" value={`${stats.completed}`} icon={CheckCircle2} tone="emerald" />
          <StatCard title="مرفوضة" value={`${stats.rejected}`} icon={XCircle} tone="rose" />
          <StatCard title="عاجلة" value={`${stats.urgent}`} icon={AlertTriangle} tone="rose" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن معاملة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-64 rounded-2xl text-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44 rounded-2xl text-sm">
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
            <Button variant="outline" size="sm" className="rounded-2xl text-xs sm:text-sm">
              <Download className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              تصدير
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl text-xs sm:text-sm">
              <Printer className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              طباعة
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Card className="rounded-2xl border shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gradient-to-b from-slate-50 to-white">
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">رقم المعاملة</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">العنوان</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">النوع</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">من</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">التاريخ</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">الأولوية</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">الحالة</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-green-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-gray-900">{transaction.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100/60 p-1.5 rounded-lg border border-green-200">
                              <FileText className="w-3.5 h-3.5 text-green-700" />
                            </div>
                            <span className="font-medium text-sm text-gray-900">{transaction.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-indigo-50/60 text-indigo-700 border-indigo-200 text-xs">
                            <Tag className="w-3 h-3 ml-1" />
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{transaction.from}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{transaction.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getPriorityBadge(transaction.priority)}</td>
                        <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewDetails(transaction.id)}
                              className="rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-xs h-8"
                            >
                              <Eye className="w-3.5 h-3.5 ml-1" />
                              عرض
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReply(transaction)}
                              className="rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-xs h-8"
                            >
                              <MessageSquare className="w-3.5 h-3.5 ml-1" />
                              رد
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 hover:bg-green-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100/60 p-2 rounded-lg border border-green-200">
                          <FileText className="w-4 h-4 text-green-700" />
                        </div>
                        <span className="font-mono text-xs font-semibold text-gray-900">{transaction.id}</span>
                      </div>
                      <div className="flex gap-2">{getPriorityBadge(transaction.priority)}</div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight">{transaction.title}</h3>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span>{transaction.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{transaction.from}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{transaction.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {getStatusBadge(transaction.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(transaction.id)}
                          className="rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-xs h-8"
                        >
                          <Eye className="w-3 h-3 ml-1" />
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReply(transaction)}
                          className="rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-xs h-8"
                        >
                          <MessageSquare className="w-3 h-3 ml-1" />
                          رد
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-16">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-lg">لا توجد معاملات مطابقة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <TransactionReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setSelectedTransaction(null);
          }}
          onSubmit={handleReplySubmit}
          transactionTitle={selectedTransaction?.title || ''}
        />
      </div>
    </div>
  );
};

export default InboxPage;
