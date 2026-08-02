import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Upload, X, Save, ArrowRight, AlertTriangle, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TransportAllowanceFormProps {
  onBack: () => void;
  onSubmitSuccess: (transactionData: any) => void;
}

const TransportAllowanceForm: React.FC<TransportAllowanceFormProps> = ({ onBack, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    employeeName: 'أحمد محمد السالم',
    employeeNumber: 'EMP-2024-001',
    department: 'قسم تقنية المعلومات',
    nationality: 'سعودي',
    requestDate: new Date().toISOString().split('T')[0],
    fromLocation: '',
    toLocation: '',
    distance: '',
    transportType: '',
    amount: '',
    reason: '',
    period: '',
    priority: 'عادي'
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transactionNumber = `TRN-${Date.now()}`;
    const transactionData = {
      id: transactionNumber,
      transaction_number: transactionNumber,
      transaction_type: 'بدل مواصلات',
      title: `طلب بدل مواصلات - ${formData.employeeName}`,
      description: formData.reason,
      employee_name: formData.employeeName,
      employee_number: formData.employeeNumber,
      department: formData.department,
      nationality: formData.nationality,
      status: 'قيد المعالجة',
      current_location: 'صادر',
      priority: formData.priority,
      date: formData.requestDate,
      from: formData.department,
      details: {
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        distance: formData.distance,
        transportType: formData.transportType,
        amount: formData.amount,
        period: formData.period
      },
      attachments: attachments.map(f => f.name)
    };

    onSubmitSuccess(transactionData);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-2xl border shadow-lg bg-gradient-to-br from-blue-50/80 to-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-700 border-2 border-blue-200">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">طلب بدل مواصلات</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">قم بتعبئة البيانات المطلوبة أدناه</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={onBack} className="rounded-xl">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employeeName" className="flex items-center gap-2">
                      <span>اسم الموظف</span>
                    </Label>
                    <Input
                      id="employeeName"
                      value={formData.employeeName}
                      disabled
                      className="rounded-xl bg-gray-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeNumber">الرقم الوظيفي</Label>
                    <Input
                      id="employeeNumber"
                      value={formData.employeeNumber}
                      disabled
                      className="rounded-xl bg-gray-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">القسم</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      disabled
                      className="rounded-xl bg-gray-50 dark:bg-neutral-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requestDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>تاريخ الطلب</span>
                    </Label>
                    <Input
                      id="requestDate"
                      type="date"
                      value={formData.requestDate}
                      onChange={(e) => handleInputChange('requestDate', e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    تفاصيل التنقل
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fromLocation">من (موقع الانطلاق)</Label>
                      <Input
                        id="fromLocation"
                        value={formData.fromLocation}
                        onChange={(e) => handleInputChange('fromLocation', e.target.value)}
                        placeholder="مثال: مكتب الرياض"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toLocation">إلى (الوجهة)</Label>
                      <Input
                        id="toLocation"
                        value={formData.toLocation}
                        onChange={(e) => handleInputChange('toLocation', e.target.value)}
                        placeholder="مثال: فرع جدة"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="distance">المسافة (كم)</Label>
                      <Input
                        id="distance"
                        type="number"
                        value={formData.distance}
                        onChange={(e) => handleInputChange('distance', e.target.value)}
                        placeholder="0"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transportType">وسيلة النقل</Label>
                      <Select value={formData.transportType} onValueChange={(value) => handleInputChange('transportType', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر وسيلة النقل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="سيارة خاصة">سيارة خاصة</SelectItem>
                          <SelectItem value="سيارة الشركة">سيارة الشركة</SelectItem>
                          <SelectItem value="أجرة">أجرة (تاكسي/أوبر)</SelectItem>
                          <SelectItem value="نقل عام">نقل عام</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>المبلغ المطلوب (ريال)</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="0.00"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="period">الفترة الزمنية</Label>
                      <Select value={formData.period} onValueChange={(value) => handleInputChange('period', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر الفترة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="يومي">يومي</SelectItem>
                          <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                          <SelectItem value="شهري">شهري</SelectItem>
                          <SelectItem value="لمرة واحدة">لمرة واحدة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">سبب الطلب</Label>
                  <textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    placeholder="اذكر سبب طلب بدل المواصلات..."
                    className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عادي">عادي</SelectItem>
                      <SelectItem value="عاجل">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>المرفقات (فواتير، إثباتات)</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-neutral-300">اضغط لتحميل الملفات</p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">PDF, JPG, PNG (حد أقصى 5MB)</p>
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-neutral-200">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">تنبيه هام:</p>
                    <p>يجب إرفاق الفواتير الأصلية أو صور واضحة منها لإتمام معالجة الطلب.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                  >
                    <Save className="ml-2 h-5 w-5" />
                    إرسال الطلب
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="rounded-xl h-12 px-8"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TransportAllowanceForm;
