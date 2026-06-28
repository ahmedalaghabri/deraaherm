import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User as User2, FileText, CheckCircle2, AlertCircle, CalendarDays, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnnualLeaveFormProps {
  onCancel?: () => void;
  onSubmit?: (data: any) => void;
}

export default function AnnualLeaveForm({ onCancel, onSubmit }: AnnualLeaveFormProps) {
  const [formData, setFormData] = useState({
    employeeName: "أحمد عبدالقادر أحمد محي الدين",
    employeeId: "000045655",
    department: "الإدارة وإدارة تقنية المعلومات",
    position: "مدير إدارة",
    email: "ahmed.mohyaldin@company.com",
    phone: "+966501234567",
    startDate: "",
    endDate: "",
    leaveDays: 0,
    leaveType: "سنوية",
    reason: "",
    emergencyContact: "",
    emergencyPhone: "",
    replacementEmployee: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const leaveBalance = {
    total: 30,
    used: 12,
    remaining: 18,
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "startDate" || field === "endDate") {
        const days = calculateDays(updated.startDate, updated.endDate);
        updated.leaveDays = days;
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) newErrors.startDate = "تاريخ بداية الإجازة مطلوب";
    if (!formData.endDate) newErrors.endDate = "تاريخ نهاية الإجازة مطلوب";
    if (formData.leaveDays > leaveBalance.remaining) {
      newErrors.endDate = `عدد الأيام المطلوبة (${formData.leaveDays}) يتجاوز الرصيد المتبقي (${leaveBalance.remaining})`;
    }
    if (!formData.reason?.trim()) newErrors.reason = "سبب الإجازة مطلوب";
    if (!formData.emergencyContact?.trim()) newErrors.emergencyContact = "جهة الاتصال في حالات الطوارئ مطلوبة";
    if (!formData.emergencyPhone?.trim()) newErrors.emergencyPhone = "رقم الطوارئ مطلوب";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onSubmit?.(formData);

      setTimeout(() => {
        onCancel?.();
      }, 2000);
    }, 1500);
  };

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="rounded-2xl border bg-gradient-to-b from-emerald-50/70 to-white shadow-sm">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">طلب إجازة سنوية</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">قم بتعبئة النموذج أدناه لتقديم طلب إجازة سنوية</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form - Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User2 className="h-5 w-5" />
                  معلومات الموظف
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">الاسم الكامل</Label>
                    <div className="mt-1 rounded-2xl border bg-neutral-50 px-3 py-2.5 text-sm">{formData.employeeName}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">الرقم الوظيفي</Label>
                    <div className="mt-1 rounded-2xl border bg-neutral-50 px-3 py-2.5 text-sm">{formData.employeeId}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">القسم</Label>
                    <div className="mt-1 rounded-2xl border bg-neutral-50 px-3 py-2.5 text-sm">{formData.department}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">المسمى الوظيفي</Label>
                    <div className="mt-1 rounded-2xl border bg-neutral-50 px-3 py-2.5 text-sm">{formData.position}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  تفاصيل الإجازة
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm">
                      تاريخ البداية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleFieldChange("startDate", e.target.value)}
                      className={cn("mt-1 rounded-2xl", errors.startDate && "border-red-500")}
                    />
                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm">
                      تاريخ النهاية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleFieldChange("endDate", e.target.value)}
                      className={cn("mt-1 rounded-2xl", errors.endDate && "border-red-500")}
                    />
                    {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                {formData.leaveDays > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl bg-blue-50 border border-blue-200"
                  >
                    <div className="flex items-center gap-2 text-blue-900">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">عدد أيام الإجازة المطلوبة: {formData.leaveDays} يوم</span>
                    </div>
                  </motion.div>
                )}

                <div>
                  <Label htmlFor="reason" className="text-sm">
                    سبب الإجازة <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="reason"
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => handleFieldChange("reason", e.target.value)}
                    className={cn(
                      "mt-1 w-full rounded-2xl border px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none",
                      errors.reason && "border-red-500"
                    )}
                    placeholder="اكتب سبب طلب الإجازة..."
                  />
                  {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                </div>

                <div>
                  <Label htmlFor="replacementEmployee" className="text-sm">
                    الموظف البديل (اختياري)
                  </Label>
                  <Input
                    id="replacementEmployee"
                    type="text"
                    value={formData.replacementEmployee}
                    onChange={(e) => handleFieldChange("replacementEmployee", e.target.value)}
                    className="mt-1 rounded-2xl"
                    placeholder="اسم الموظف البديل خلال فترة الإجازة"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  معلومات الطوارئ
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact" className="text-sm">
                      جهة الاتصال <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleFieldChange("emergencyContact", e.target.value)}
                      className={cn("mt-1 rounded-2xl", errors.emergencyContact && "border-red-500")}
                      placeholder="اسم الشخص للاتصال في حالات الطوارئ"
                    />
                    {errors.emergencyContact && <p className="text-xs text-red-500 mt-1">{errors.emergencyContact}</p>}
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone" className="text-sm">
                      رقم الطوارئ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleFieldChange("emergencyPhone", e.target.value)}
                      className={cn("mt-1 rounded-2xl", errors.emergencyPhone && "border-red-500")}
                      placeholder="+966501234567"
                    />
                    {errors.emergencyPhone && <p className="text-xs text-red-500 mt-1">{errors.emergencyPhone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar - Right Side */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Leave Balance */}
            <Card className="rounded-2xl border bg-gradient-to-b from-emerald-50/80 to-white border-emerald-100 shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  رصيد الإجازات
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200">
                  <span className="text-sm text-muted-foreground">الرصيد الكلي</span>
                  <span className="text-lg font-semibold text-emerald-700">{leaveBalance.total} يوم</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200">
                  <span className="text-sm text-muted-foreground">المستخدم</span>
                  <span className="text-lg font-semibold text-amber-700">{leaveBalance.used} يوم</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-blue-200">
                  <span className="text-sm text-muted-foreground">المتبقي</span>
                  <span className="text-lg font-semibold text-blue-700">{leaveBalance.remaining} يوم</span>
                </div>
              </CardContent>
            </Card>

            {/* Status/Instructions */}
            <Card className="rounded-2xl border bg-gradient-to-b from-blue-50/70 to-white border-blue-100 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <p className="font-semibold">ملاحظات هامة:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• يجب تقديم الطلب قبل موعد الإجازة بأسبوعين على الأقل</li>
                      <li>• سيتم مراجعة الطلب من قبل المدير المباشر</li>
                      <li>• تأكد من تحديث معلومات الطوارئ</li>
                      <li>• يمكن إلغاء الطلب قبل الموافقة عليه</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSubmit}
                disabled={saving || saved}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Clock className="ml-2 h-5 w-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="ml-2 h-5 w-5" />
                    تم الحفظ بنجاح
                  </>
                ) : (
                  <>
                    <FileText className="ml-2 h-5 w-5" />
                    تقديم الطلب
                  </>
                )}
              </Button>

              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full py-6 rounded-2xl text-base"
                disabled={saving}
              >
                إلغاء
              </Button>
            </div>

            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200"
              >
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">تم تقديم طلب الإجازة بنجاح</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
