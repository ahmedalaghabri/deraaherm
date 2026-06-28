import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, User, Calendar, Tag, CheckCircle, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp, Building, Phone, Mail, MapPin, Download, Eye, Paperclip, Printer, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { cn } from '../lib/utils';

interface TransactionDetailsPageProps {
  transactionId: string;
  onBack: () => void;
}

interface TimelineStep {
  id: number;
  title: string;
  handler: string;
  handlerId?: string;
  department: string;
  action: string;
  date: string;
  time: string;
  status: 'completed' | 'in-progress' | 'pending' | 'rejected' | 'returned';
  notes?: string;
  decision?: string;
  duration?: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
  additionalInfo?: {
    phone?: string;
    email?: string;
    location?: string;
    approvedDuration?: number;
    balance?: number;
    visaStatus?: string;
    equipmentReceived?: string[];
  };
}

const TransactionDetailsPage: React.FC<TransactionDetailsPageProps> = ({ transactionId, onBack }) => {
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const transactionData = {
    '2024-001': {
      id: '2024-001',
      title: 'طلب إجازة سنوية - احمد عبدالقادر احمد محي الدين',
      type: 'إجازة سنوية خارج المملكة',
      from: 'إدارة تجربة العميل',
      submittedDate: '27/10/2025',
      priority: 'medium',
      status: 'completed',
      description: 'طلب إجازة سنوية لمدة 15 يوم خارج المملكة',
      requestor: 'احمد عبدالقادر احمد محي الدين',
      requestorId: '45655',
    },
    '2024-002': {
      id: '2024-002',
      title: 'طلب صرف مستحقات - فاطمة علي',
      type: 'مالية',
      from: 'قسم الحسابات',
      submittedDate: '2024-10-14',
      priority: 'high',
      status: 'pending',
      description: 'طلب صرف مستحقات مالية متأخرة',
      requestor: 'فاطمة علي حسن',
      requestorId: 'EMP-2024-089',
    }
  };

  const timelineData: Record<string, TimelineStep[]> = {
    '2024-001': [
      {
        id: 1,
        title: 'اخصائي شؤون الموظفين - (ترصيد)',
        handler: 'صالح عبدالله التويجري',
        handlerId: '45655',
        department: 'إدارة شؤون الموظفين',
        action: 'إعادة لمقدم الطلب',
        date: '27/10/2025',
        time: '01:14:26 م',
        status: 'returned',
        duration: '3 دقائق',
        notes: 'التأكد من تاريخ الاجازة',
        additionalInfo: {
          balance: 0,
        }
      },
      {
        id: 2,
        title: 'مقدم الطلب',
        handler: 'احمد عبدالقادر احمد محي الدين',
        handlerId: '45655',
        department: 'إدارة تجربة العميل',
        action: 'تم الاطلاع',
        date: '27/10/2025',
        time: '01:15:03 م',
        status: 'completed',
        duration: '37 ثانية',
        notes: 'تاريخ بداية الاجازة 2025-11-2'
      },
      {
        id: 3,
        title: 'اخصائي شؤون الموظفين - (ترصيد)',
        handler: 'صالح عبدالله التويجري',
        department: 'إدارة شؤون الموظفين',
        action: 'موافقة',
        date: '27/10/2025',
        time: '01:18:35 م',
        status: 'completed',
        duration: '3 دقائق 32 ثانية',
        notes: 'مع راتب',
        attachments: [
          {
            name: 'نموذج_طلب_الاجازة.pdf',
            size: '245 KB',
            type: 'pdf'
          }
        ],
        additionalInfo: {
          balance: 63,
        }
      },
      {
        id: 4,
        title: 'المدير المباشر',
        handler: 'جهاد عبده محمد علي غانم',
        handlerId: '42291',
        department: 'إدارة تجربة العميل',
        action: 'الموافقة',
        date: '27/10/2025',
        time: '02:42:37 م',
        status: 'completed',
        duration: '1 ساعة 24 دقيقة',
        notes: 'Ok',
        additionalInfo: {
          location: 'الإدارة العامة'
        }
      },
      {
        id: 5,
        title: 'الموظف المستلم',
        handler: 'جهاد عبده محمد علي غانم',
        handlerId: '42291',
        department: 'إدارة تجربة العميل',
        action: 'تم استلام جميع المهام والاجهزة',
        date: '27/10/2025',
        time: '02:42:57 م',
        status: 'completed',
        duration: '20 ثانية',
        notes: 'Ok',
        additionalInfo: {
          equipmentReceived: ['جهاز كمبيوتر', 'لاب توب', 'ماوس', 'كيبورد']
        }
      },
      {
        id: 6,
        title: 'مدير الادارة',
        handler: 'جهاد عبده محمد علي غانم',
        department: 'إدارة تجربة العميل',
        action: 'الموافقة',
        date: '27/10/2025',
        time: '02:43:25 م',
        status: 'completed',
        duration: '28 ثانية',
        notes: 'Ok',
        additionalInfo: {
          approvedDuration: 15
        }
      },
      {
        id: 7,
        title: 'اخصائي شؤون الموظفين - تحديد تاشيرة',
        handler: 'صالح عبدالله التويجري',
        department: 'إدارة شؤون الموظفين',
        action: 'تحديد وضع التاشيرة',
        date: '27/10/2025',
        time: '04:47:51 م',
        status: 'completed',
        duration: '2 ساعة 4 دقائق',
        notes: 'مع الراتب لايتم تصفية المستحقات',
        additionalInfo: {
          visaStatus: 'على حساب الشركة',
          approvedDuration: 15
        }
      },
      {
        id: 8,
        title: 'موظف التنسيق والمتابعة (إجازة)',
        handler: 'عبدالله سعيد مبارك ماحيله',
        department: 'إدارة شؤون الموظفين',
        action: 'تم الاطلاع',
        date: '28/10/2025',
        time: '08:02:31 ص',
        status: 'completed',
        duration: '15 ساعة 15 دقيقة',
        notes: '0',
        additionalInfo: {
          visaStatus: 'رسوم التاشيرة: 200 ريال على حساب الشركة'
        }
      },
      {
        id: 9,
        title: 'محاسب نفقات',
        handler: 'خالد محمد السيد حسين',
        department: 'إدارة الحسابات',
        action: 'تم انزال المعاملة في الحسابات',
        date: '28/10/2025',
        time: '09:34:58 ص',
        status: 'completed',
        duration: '1 ساعة 32 دقيقة',
        notes: 'لا'
      },
      {
        id: 10,
        title: 'مشرف دعم فني',
        handler: 'وليد حسان ثابت سالم',
        department: 'إدارة الدعم الفني',
        action: 'تم التاكد من تسليم أجهزة الحاسب الشخصية',
        date: '28/10/2025',
        time: '11:26:09 ص',
        status: 'completed',
        duration: '1 ساعة 51 دقيقة',
        notes: 'لا'
      },
      {
        id: 11,
        title: 'منسق المركبات والنقل',
        handler: 'محمود السعيد محمد ابو طريه',
        department: 'إدارة النقل',
        action: 'تم استلام السيارة',
        date: '28/10/2025',
        time: '01:45:53 م',
        status: 'completed',
        duration: '2 ساعة 20 دقيقة',
        notes: 'لا يوجد',
        additionalInfo: {
          visaStatus: 'لا يوجد لديه سيارة'
        }
      },
      {
        id: 12,
        title: 'محاسب اول / عهد نقدية',
        handler: 'محمد صلاح كامل محمد',
        department: 'إدارة الحسابات',
        action: 'تم التاكد من استلام العهد',
        date: '28/10/2025',
        time: '03:52:36 م',
        status: 'completed',
        duration: '2 ساعة 7 دقائق',
        notes: 'لا يوجد'
      },
      {
        id: 13,
        title: 'حسابات الاصول',
        handler: 'وليد صلاح انور الحداد',
        department: 'إدارة الحسابات',
        action: 'اعادة للموظف المستلم',
        date: '28/10/2025',
        time: '04:15:45 م',
        status: 'returned',
        duration: '23 دقيقة',
        notes: 'برجاء التاكيد على استلام الاصول التالية -1 جهاز كمبيوتر مع شاشه -2 asus viio book pro 16x oled لاب توب -3 MACBOOK PRO 16 M4 لاب توب'
      },
      {
        id: 14,
        title: 'الموظف المستلم',
        handler: 'جهاد عبده محمد علي غانم',
        handlerId: '42291',
        department: 'إدارة تجربة العميل',
        action: 'تم استلام جميع المهام والاجهزة',
        date: '28/10/2025',
        time: '04:42:34 م',
        status: 'completed',
        duration: '27 دقيقة',
        notes: 'Ok'
      },
      {
        id: 15,
        title: 'حسابات الاصول',
        handler: 'وليد صلاح انور الحداد',
        department: 'إدارة الحسابات',
        action: 'تم التاكد من تسليم الاصول',
        date: '28/10/2025',
        time: '04:46:47 م',
        status: 'completed',
        duration: '4 دقائق',
        notes: 'لا'
      },
      {
        id: 16,
        title: 'مدير الموارد البشرية',
        handler: 'فهد احمد علي',
        department: 'إدارة الموارد البشرية',
        action: 'قيد المعالجة',
        date: '01/11/2025',
        time: '10:15:00 ص',
        status: 'in-progress',
        duration: 'جاري المعالجة...',
        notes: 'جاري المراجعة'
      },
      {
        id: 17,
        title: 'المدير المالي',
        handler: 'عمر خالد محمد',
        department: 'إدارة المالية',
        action: 'في الانتظار',
        date: '-',
        time: '-',
        status: 'pending',
        duration: '-',
        notes: 'معلقة'
      }
    ],
    '2024-002': [
      {
        id: 1,
        title: 'تقديم الطلب',
        handler: 'فاطمة علي حسن',
        department: 'قسم الحسابات',
        action: 'تم تقديم الطلب',
        date: '2024-10-14',
        time: '10:15',
        status: 'completed',
        duration: '2 دقيقة'
      },
      {
        id: 2,
        title: 'مراجعة المشرف المباشر',
        handler: 'سارة أحمد',
        department: 'قسم الحسابات',
        action: 'في انتظار المراجعة',
        date: '-',
        time: '-',
        status: 'pending',
        duration: '-'
      }
    ]
  };

  const transaction = transactionData[transactionId as keyof typeof transactionData];
  const timeline = timelineData[transactionId] || [];

  const downloadSummary = () => {
    const summary = `
ملخص المعاملة
==============

رقم المعاملة: ${transaction.id}
العنوان: ${transaction.title}
النوع: ${transaction.type}
مقدم الطلب: ${transaction.requestor}
الرقم الوظيفي: ${transaction.requestorId}
تاريخ التقديم: ${transaction.submittedDate}
الحالة: ${transaction.status}
الوصف: ${transaction.description}

مسار المعاملة:
===============

${timeline.map((step, index) => `
${index + 1}. ${step.title}
   المسؤول: ${step.handler}
   الإدارة: ${step.department}
   الإجراء: ${step.action}
   التاريخ: ${step.date} ${step.time}
   الحالة: ${step.status}
   الوقت المستغرق: ${step.duration || '-'}
   ${step.notes ? `الملاحظات: ${step.notes}` : ''}
`).join('\n')}
    `.trim();

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ملخص_المعاملة_${transaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePreview = (fileName: string) => {
    setPreviewFile(fileName);
    alert(`معاينة الملف: ${fileName}\n(في التطبيق الفعلي، سيتم فتح معاين PDF)`);
  };

  const handleDownload = (fileName: string) => {
    alert(`تحميل الملف: ${fileName}\n(في التطبيق الفعلي، سيتم تحميل الملف)`);
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Button onClick={onBack} variant="outline" className="mb-6 rounded-xl">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <Card className="p-6">
            <p className="text-center text-gray-500">المعاملة غير موجودة</p>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-300 bg-green-50/50';
      case 'in-progress':
        return 'border-blue-300 bg-blue-50/50';
      case 'returned':
        return 'border-orange-300 bg-orange-50/50';
      case 'pending':
        return 'border-gray-300 bg-gray-50/50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClasses = 'w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-2.5 rounded-full';
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${iconClasses} text-white bg-green-500`} />;
      case 'in-progress':
        return <Clock className={`${iconClasses} text-white bg-blue-500 animate-pulse`} />;
      case 'returned':
        return <AlertCircle className={`${iconClasses} text-white bg-orange-500`} />;
      case 'pending':
        return <Clock className={`${iconClasses} text-gray-400 bg-gray-200`} />;
      default:
        return <Clock className={`${iconClasses} text-gray-400`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className="min-h-screen"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
        >
          <Button onClick={onBack} variant="outline" className="rounded-2xl w-full sm:w-auto">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={downloadSummary}
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
              تنزيل
            </Button>
            <Button variant="outline" size="sm" className="rounded-2xl text-xs sm:text-sm flex-1 sm:flex-none">
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
              طباعة
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="rounded-2xl border bg-gradient-to-b from-blue-50/70 to-white shadow-sm">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-blue-100/60 text-blue-700 border border-blue-200">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg lg:text-xl">{transaction.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">تفاصيل كاملة عن المعاملة</p>
                  </div>
                </div>
                <Badge className={`${getPriorityColor(transaction.priority)} px-3 py-1.5 rounded-lg border text-xs font-semibold w-fit`}>
                  {transaction.priority === 'high' ? 'عالية' : transaction.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-gray-600">النوع:</span>
                  <span className="font-semibold text-gray-900">{transaction.type}</span>
                </div>

                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span className="text-gray-600">مقدم الطلب:</span>
                  <span className="font-semibold text-gray-900">{transaction.requestor}</span>
                </div>

                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <span className="text-gray-600">الرقم الوظيفي:</span>
                  <span className="font-semibold text-gray-900">{transaction.requestorId}</span>
                </div>

                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  <span className="text-gray-600">تاريخ التقديم:</span>
                  <span className="font-semibold text-gray-900">{transaction.submittedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Badge className="rounded-full bg-white/60 backdrop-blur border border-slate-200 text-slate-700">
                  رقم المعاملة: {transaction.id}
                </Badge>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">الوصف: </span>
                  {transaction.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-2xl border shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100/60 text-blue-700 border border-blue-200">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                مسار المعاملة
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
            {timeline.map((step, index) => (
              <div key={step.id} className="relative">
                {index !== timeline.length - 1 && (
                  <div
                    className={`absolute right-[20px] sm:right-[24px] top-[44px] sm:top-[52px] w-px h-[calc(100%+12px)] sm:h-[calc(100%+16px)] ${
                      step.status === 'completed' ? 'bg-green-300' : step.status === 'returned' ? 'bg-orange-300' : 'bg-gray-200'
                    }`}
                  />
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`item-${step.id}`} className="border-none">
                    <div className={`rounded-xl sm:rounded-2xl border-2 ${getStatusColor(step.status)} overflow-hidden`}>
                      <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:no-underline hover:bg-white/30 transition-colors">
                        <div className="flex gap-2 sm:gap-4 items-start sm:items-center w-full">
                          <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>

                          <div className="flex-1 text-right min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 leading-tight">{step.title}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                  <span className="flex items-center gap-1 truncate">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{step.handler}</span>
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{step.department}</span>
                                  </span>
                                </div>
                              </div>
                              {step.date !== '-' && (
                                <div className="text-right sm:text-left sm:mr-4 flex-shrink-0">
                                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{step.date}</p>
                                  <p className="text-xs text-gray-600">{step.time}</p>
                                  {step.duration && (
                                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                                      <Clock className="w-3 h-3 inline ml-1" />
                                      {step.duration}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                        <div className="mr-0 sm:mr-10 space-y-3">
                          <div className="bg-white/70 rounded-lg p-3 sm:p-4 border border-gray-200">
                            <div className="flex items-start gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">الإجراء المتخذ</p>
                                <p className="text-xs sm:text-sm text-gray-900">{step.action}</p>
                              </div>
                            </div>
                          </div>

                          {step.notes && (
                            <div className="bg-blue-50/70 rounded-lg p-3 sm:p-4 border border-blue-200">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">ملاحظات</p>
                                  <p className="text-xs sm:text-sm text-gray-800 break-words">{step.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.attachments && step.attachments.length > 0 && (
                            <div className="bg-purple-50/70 rounded-lg p-3 sm:p-4 border border-purple-200">
                              <div className="flex items-start gap-2 mb-3">
                                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm font-semibold text-purple-900">المرفقات</p>
                              </div>
                              <div className="space-y-2">
                                {step.attachments.map((file, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-lg p-2 sm:p-3 border border-purple-200">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{file.size}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handlePreview(file.name)}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 sm:flex-none justify-center"
                                      >
                                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                        استعراض
                                      </button>
                                      <button
                                        onClick={() => handleDownload(file.name)}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex-1 sm:flex-none justify-center"
                                      >
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                        تحميل
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {step.additionalInfo && (
                            <div className="bg-gray-50/70 rounded-lg p-3 sm:p-4 border border-gray-200">
                              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">معلومات إضافية</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {step.additionalInfo.phone && (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">الهاتف:</span>
                                    <span className="font-medium text-gray-900">{step.additionalInfo.phone}</span>
                                  </div>
                                )}
                                {step.additionalInfo.location && (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">الموقع:</span>
                                    <span className="font-medium text-gray-900">{step.additionalInfo.location}</span>
                                  </div>
                                )}
                                {step.additionalInfo.approvedDuration !== undefined && (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">المدة المعتمدة:</span>
                                    <span className="font-medium text-gray-900">{step.additionalInfo.approvedDuration} يوم</span>
                                  </div>
                                )}
                                {step.additionalInfo.balance !== undefined && (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">الرصيد:</span>
                                    <span className="font-medium text-gray-900">{step.additionalInfo.balance} يوم</span>
                                  </div>
                                )}
                                {step.additionalInfo.visaStatus && (
                                  <div className="flex items-center gap-2 text-xs sm:text-sm col-span-1 sm:col-span-2">
                                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-gray-600">حالة التأشيرة:</span>
                                    <span className="font-medium text-gray-900">{step.additionalInfo.visaStatus}</span>
                                  </div>
                                )}
                                {step.additionalInfo.equipmentReceived && step.additionalInfo.equipmentReceived.length > 0 && (
                                  <div className="col-span-1 sm:col-span-2">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">الأجهزة المستلمة:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {step.additionalInfo.equipmentReceived.map((item, idx) => (
                                        <Badge key={idx} className="bg-green-100 text-green-800 border border-green-300 text-xs">
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionDetailsPage;
