import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ChevronUp, ChevronDown, AlertCircle, CheckCircle2, FileText, Send, User, Building2, Briefcase, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTabs from './PageTabs';
import StatCard from './ds/StatCard';

interface ExitPermit {
  id: string;
  employeeName: string;
  employeeId: string;
  requestType: string;
  decision: string;
  returnTime: string;
  exitTime: string;
  date: string;
  refNumber: string;
}

const demoEmployee = {
  employeeId: "000045655",
  name: "أحمد عبدالقادر أحمد محي الدين",
  department: "الإدارة وإدارة تقنية المعلومات",
};

export default function ExitPermitForm() {
  const [selectedDate, setSelectedDate] = useState('');
  const [fromHour, setFromHour] = useState(0);
  const [fromMinute, setFromMinute] = useState(0);
  const [toHour, setToHour] = useState(0);
  const [toMinute, setToMinute] = useState(0);
  const [reason, setReason] = useState('');
  const [showExitTypes, setShowExitTypes] = useState(false);
  const [selectedExitType, setSelectedExitType] = useState('');
  const [activeTab, setActiveTab] = useState<'external' | 'tasks'>('external');

  const exitTypes = [
    'مهمة عمل وفق الدوام الرسمي',
    'غرض شخصي',
    'مأمورية عمل خارجية بالأيام',
    'ساعات صلة مكتب فريست',
    'إجازة السبت',
    'إذن شخصي إدارة عامة'
  ];

  const externalMissions: ExitPermit[] = [
    {
      id: '1',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '564047',
      requestType: 'مأمورية عمل خارجية بالأيام',
      decision: 'موافق',
      returnTime: '23:55:00',
      exitTime: '08:00:00',
      date: '11/20/2025',
      refNumber: '564047'
    },
    {
      id: '2',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '552423',
      requestType: 'مأمورية عمل خارجية بالأيام',
      decision: 'موافق',
      returnTime: '23:55:00',
      exitTime: '08:00:00',
      date: '10/28/2025',
      refNumber: '552423'
    },
    {
      id: '3',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '552421',
      requestType: 'مأمورية عمل خارجية بالأيام',
      decision: 'موافق مع التحفظ',
      returnTime: '23:55:00',
      exitTime: '08:00:00',
      date: '10/15/2025',
      refNumber: '552421'
    }
  ];

  const taskPermits: ExitPermit[] = [
    {
      id: '1',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '564047',
      requestType: 'مهمة عمل وفق الدوام الرسمي',
      decision: 'موافق',
      returnTime: '23:55:00',
      exitTime: '19:00:00',
      date: '11/17/2025',
      refNumber: '564047'
    },
    {
      id: '2',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '552423',
      requestType: 'مهمة عمل وفق الدوام الرسمي',
      decision: 'موافق',
      returnTime: '23:55:00',
      exitTime: '19:00:00',
      date: '10/28/2025',
      refNumber: '552423'
    },
    {
      id: '3',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '552421',
      requestType: 'غرض شخصي',
      decision: 'موافق',
      returnTime: '16:00:00',
      exitTime: '14:00:00',
      date: '10/26/2025',
      refNumber: '552421'
    },
    {
      id: '4',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551736',
      requestType: 'ساعات صلة مكتب فريست',
      decision: 'موافق',
      returnTime: '15:30:00',
      exitTime: '13:00:00',
      date: '10/19/2025',
      refNumber: '551736'
    },
    {
      id: '5',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551028',
      requestType: 'إجازة السبت',
      decision: 'موافق',
      returnTime: '23:55:00',
      exitTime: '08:00:00',
      date: '10/15/2025',
      refNumber: '551028'
    },
    {
      id: '6',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551027',
      requestType: 'غرض شخصي',
      decision: 'مرفوض',
      returnTime: '17:00:00',
      exitTime: '15:00:00',
      date: '10/12/2025',
      refNumber: '551027'
    },
    {
      id: '7',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551025',
      requestType: 'إذن شخصي إدارة عامة',
      decision: 'قيد المراجعة',
      returnTime: '14:00:00',
      exitTime: '10:00:00',
      date: '10/10/2025',
      refNumber: '551025'
    },
    {
      id: '8',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551020',
      requestType: 'مهمة عمل وفق الدوام الرسمي',
      decision: 'موافق مع التحفظ',
      returnTime: '23:55:00',
      exitTime: '18:00:00',
      date: '10/08/2025',
      refNumber: '551020'
    },
    {
      id: '9',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551015',
      requestType: 'ساعات صلة مكتب فريست',
      decision: 'موافق',
      returnTime: '16:30:00',
      exitTime: '13:30:00',
      date: '10/05/2025',
      refNumber: '551015'
    },
    {
      id: '10',
      employeeName: 'أحمد عبدالقادر محي الدين',
      employeeId: '551010',
      requestType: 'غرض شخصي',
      decision: 'موافق',
      returnTime: '15:00:00',
      exitTime: '13:00:00',
      date: '10/01/2025',
      refNumber: '551010'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      date: selectedDate,
      from: `${fromHour}:${fromMinute}`,
      to: `${toHour}:${toMinute}`,
      reason,
      exitType: selectedExitType
    });
  };

  const incrementValue = (
    value: number,
    setter: (val: number) => void,
    max: number
  ) => {
    setter(value >= max ? 0 : value + 1);
  };

  const decrementValue = (
    value: number,
    setter: (val: number) => void,
    max: number
  ) => {
    setter(value <= 0 ? max : value - 1);
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'موافق':
        return 'rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/30 text-xs';
      case 'مرفوض':
        return 'rounded-full bg-rose-100 text-rose-800 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/30 text-xs';
      case 'قيد المراجعة':
        return 'rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/30 text-xs';
      case 'موافق مع التحفظ':
        return 'rounded-full bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/30 text-xs';
      default:
        return 'rounded-full bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 text-xs';
    }
  };

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-2xl border bg-gradient-to-b from-sky-50/70 to-white dark:from-neutral-800 dark:to-neutral-800 dark:border-neutral-700 shadow-sm">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl dark:text-neutral-100">طلب إذن خروج</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 px-4 sm:px-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-medium truncate dark:text-neutral-100">{demoEmployee.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-muted-foreground">القسم:</span>
                <span className="font-medium truncate dark:text-neutral-100">{demoEmployee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Badge className="rounded-full bg-white/60 backdrop-blur border border-slate-200 text-slate-700 dark:bg-neutral-700/60 dark:border-neutral-600 dark:text-neutral-300 text-xs">
                  الرقم الوظيفي: {demoEmployee.employeeId}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          <StatCard title="إجمالي الطلبات" value="12" icon={FileText} />
          <StatCard title="الطلبات المعتمدة" value="10" icon={CheckCircle2} />
          <StatCard title="قيد المراجعة" value="2" icon={Clock} />
          <StatCard title="المرفوضة" value="0" icon={AlertCircle} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-800/70 dark:supports-[backdrop-filter]:bg-neutral-800/60 shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 dark:text-neutral-100">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  نموذج طلب إذن خروج
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4 sm:space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
                        تاريخ الاستئذان
                      </Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-right h-10 sm:h-12 border-2 border-gray-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:border-sky-500 rounded-xl transition-all text-sm"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                        نوع الإذن
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowExitTypes(!showExitTypes)}
                        className="w-full h-10 sm:h-12 px-3 sm:px-4 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-600 hover:border-sky-400 rounded-xl text-right flex items-center justify-between transition-all group text-sm"
                      >
                        <span className={selectedExitType ? 'text-gray-900 dark:text-neutral-100' : 'text-gray-400 dark:text-neutral-500'}>
                          {selectedExitType || 'اختيار نوع الإذن'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-sky-600 transition-transform ${
                            showExitTypes ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {showExitTypes && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-2 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-600 rounded-xl shadow-2xl overflow-hidden"
                          >
                            {exitTypes.map((type, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setSelectedExitType(type);
                                  setShowExitTypes(false);
                                }}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-right hover:bg-sky-50 dark:hover:bg-neutral-700 dark:text-neutral-200 transition-colors border-b border-gray-100 dark:border-neutral-700 last:border-0 text-xs sm:text-sm"
                              >
                                {type}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
                          من الساعة
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500 dark:text-neutral-400 mb-1 block">ساعة</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={fromHour}
                                onChange={(e) => setFromHour(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="text-center h-10 sm:h-12 border-2 border-gray-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:border-sky-500 rounded-xl text-sm"
                                min="0"
                                max="23"
                              />
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => incrementValue(fromHour, setFromHour, 23)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => decrementValue(fromHour, setFromHour, 23)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500 dark:text-neutral-400 mb-1 block">دقيقة</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={fromMinute}
                                onChange={(e) => setFromMinute(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="text-center h-10 sm:h-12 border-2 border-gray-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:border-sky-500 rounded-xl text-sm"
                                min="0"
                                max="59"
                              />
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => incrementValue(fromMinute, setFromMinute, 59)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => decrementValue(fromMinute, setFromMinute, 59)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
                          إلى الساعة
                        </Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500 dark:text-neutral-400 mb-1 block">ساعة</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={toHour}
                                onChange={(e) => setToHour(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="text-center h-10 sm:h-12 border-2 border-gray-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:border-sky-500 rounded-xl text-sm"
                                min="0"
                                max="23"
                              />
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => incrementValue(toHour, setToHour, 23)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => decrementValue(toHour, setToHour, 23)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500 dark:text-neutral-400 mb-1 block">دقيقة</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={toMinute}
                                onChange={(e) => setToMinute(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="text-center h-10 sm:h-12 border-2 border-gray-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:border-sky-500 rounded-xl text-sm"
                                min="0"
                                max="59"
                              />
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => incrementValue(toMinute, setToMinute, 59)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => decrementValue(toMinute, setToMinute, 59)}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-neutral-700 dark:text-neutral-400 rounded"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400" />
                        الأسباب والملاحظات
                      </Label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder:text-neutral-500 focus:border-sky-500 rounded-xl resize-none focus:outline-none transition-all text-sm"
                        placeholder="اكتب السبب والملاحظات هنا..."
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    تقديم الطلب
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-800/70 dark:supports-[backdrop-filter]:bg-neutral-800/60 shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 dark:text-neutral-100">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  طلبات الساعات الإدارية
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-neutral-400 font-medium text-xs sm:text-sm">لا يوجد طلبات سابقة</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-800/70 dark:supports-[backdrop-filter]:bg-neutral-800/60 shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 dark:text-neutral-100">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                  طلبات سابقة
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-neutral-400 font-medium text-xs sm:text-sm">لا يوجد طلبات سابقة</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-800/70 dark:supports-[backdrop-filter]:bg-neutral-800/60 shadow-sm">
            <CardHeader className="px-4 sm:px-6 pb-0">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 mb-4 dark:text-neutral-100">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                سجل الأذونات والمأموريات
              </CardTitle>

              <PageTabs
                tabs={[
                  ["external", "مأموريات العمل الخارجية", Briefcase],
                  ["tasks", "أذونات المهام", CheckSquare],
                ]}
                active={activeTab}
                onChange={(key) => setActiveTab(key as typeof activeTab)}
              />
            </CardHeader>

            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {activeTab === 'external' ? (
                  <motion.div
                    key="external"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full min-w-[900px] text-xs sm:text-sm">
                      <thead className="bg-gradient-to-b from-slate-50/70 to-white/80 dark:from-neutral-800 dark:to-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-800/80 dark:text-neutral-300">
                        <tr className="text-right">
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">رقم مرجعي</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">التاريخ</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">وقت الخروج</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">وقت العودة</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">قرار مدير الإدارة</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">نوع المأمورية</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">الموظف</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">ملاحظة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {externalMissions.map((permit, index) => (
                          <motion.tr
                            key={permit.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-t dark:border-neutral-700/60 dark:text-neutral-200 hover:bg-sky-50/30 dark:hover:bg-neutral-700/30 transition-colors"
                          >
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.refNumber}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.date}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.exitTime}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.returnTime}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <Badge className={getDecisionBadge(permit.decision)}>
                                {permit.decision}
                              </Badge>
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.requestType}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.employeeName}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-400">—</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                ) : (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-x-auto"
                  >
                    <table className="w-full min-w-[900px] text-xs sm:text-sm">
                      <thead className="bg-gradient-to-b from-slate-50/70 to-white/80 dark:from-neutral-800 dark:to-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-800/80 dark:text-neutral-300">
                        <tr className="text-right">
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">رقم مرجعي</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">التاريخ</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">وقت الخروج</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">وقت العودة</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">قرار مدير الإدارة</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">نوع الإذن</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">الموظف</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium">ملاحظة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskPermits.map((permit, index) => (
                          <motion.tr
                            key={permit.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-t dark:border-neutral-700/60 dark:text-neutral-200 hover:bg-sky-50/30 dark:hover:bg-neutral-700/30 transition-colors"
                          >
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.refNumber}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.date}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.exitTime}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.returnTime}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                              <Badge className={getDecisionBadge(permit.decision)}>
                                {permit.decision}
                              </Badge>
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.requestType}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3">{permit.employeeName}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-gray-400">—</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
