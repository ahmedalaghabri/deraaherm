import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Upload, X, Check, Save, AlertTriangle, FileText, Clock, User as User2, Heart, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SickLeaveFormProps = {
  onCancel?: () => void;
  onSaved?: (data: any) => void;
};

export default function SickLeaveForm({ onCancel, onSaved }: SickLeaveFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number }>>([]);

  const [form, setForm] = useState({
    employeeName: "أحمد عبدالقادر أحمد محي الدين",
    employeeId: "000045655",
    department: "الإدارة وإدارة تقنية المعلومات",
    position: "مدير تقنية المعلومات",
    phone: "",
    email: "",
    startDate: "",
    endDate: "",
    duration: "",
    leaveType: "إجازة مرضية عادية",
    diagnosis: "",
    doctorName: "",
    hospitalName: "",
    medicalReportNo: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  });

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "startDate" || k === "endDate") {
      calculateDuration({ ...form, [k]: v });
    }
  }

  function calculateDuration(formData: typeof form) {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setForm((f) => ({ ...f, duration: `${diffDays} ${diffDays === 1 ? 'يوم' : diffDays === 2 ? 'يومان' : 'أيام'}` }));
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.startDate) e.startDate = "تاريخ بداية الإجازة مطلوب";
    if (!form.endDate) e.endDate = "تاريخ نهاية الإجازة مطلوب";
    if (!form.diagnosis?.trim()) e.diagnosis = "التشخيص مطلوب";
    if (!form.doctorName?.trim()) e.doctorName = "اسم الطبيب مطلوب";
    if (attachments.length === 0) e.attachments = "يجب إرفاق التقرير الطبي";

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end < start) {
        e.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onFilesSelected(files: FileList | null) {
    const list = Array.from(files || []);
    if (!list.length) return;
    setAttachments((prev) => [
      ...prev,
      ...list.map((f) => ({
        id: crypto.randomUUID?.() || String(Math.random()),
        name: f.name,
        size: f.size,
      })),
    ]);
    setErrors((prev) => ({ ...prev, attachments: "" }));
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onSaved?.({ ...form, attachments });
      setTimeout(() => {
        onCancel?.();
      }, 2000);
    }, 1500);
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="mx-auto max-w-[1200px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="rounded-2xl border bg-gradient-to-b from-rose-50/70 to-white border-rose-100 shadow-sm">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 shadow-sm">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">طلب إجازة مرضية</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      يرجى تعبئة جميع الحقول المطلوبة وإرفاق التقرير الطبي
                    </p>
                  </div>
                </div>
                <Badge className="rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100">
                  <Clock className="ml-1 h-3 w-3" />
                  قيد التعبئة
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-emerald-900">تم إرسال الطلب بنجاح</div>
                <div className="text-sm text-emerald-700">سيتم مراجعة طلبك من قبل إدارة الموارد البشرية</div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* معلومات الموظف */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User2 className="h-5 w-5" />
                    معلومات الموظف
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6">
                  <div>
                    <Label className="text-xs sm:text-sm">الاسم الكامل</Label>
                    <div className="mt-1.5 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm">
                      {form.employeeName}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">الرقم الوظيفي</Label>
                    <div className="mt-1.5 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm">
                      {form.employeeId}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">القسم</Label>
                    <div className="mt-1.5 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm">
                      {form.department}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">المسمى الوظيفي</Label>
                    <div className="mt-1.5 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm">
                      {form.position}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">رقم الجوال</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        className="pr-10 rounded-xl text-sm"
                        placeholder="05XXXXXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        className="pr-10 rounded-xl text-sm"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* تفاصيل الإجازة */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm h-full">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    تفاصيل الإجازة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        تاريخ البداية <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setField("startDate", e.target.value)}
                        className={cn("rounded-xl mt-1.5 text-sm", errors.startDate && "border-red-500")}
                      />
                      {errors.startDate && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.startDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">
                        تاريخ النهاية <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setField("endDate", e.target.value)}
                        className={cn("rounded-xl mt-1.5 text-sm", errors.endDate && "border-red-500")}
                      />
                      {errors.endDate && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {form.duration && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900 font-medium">مدة الإجازة: {form.duration}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs sm:text-sm">نوع الإجازة المرضية</Label>
                    <select
                      value={form.leaveType}
                      onChange={(e) => setField("leaveType", e.target.value)}
                      className="w-full rounded-xl px-3 py-2 bg-white border border-neutral-200 mt-1.5 text-sm"
                    >
                      <option>إجازة مرضية عادية</option>
                      <option>إجازة مرضية طارئة</option>
                      <option>إجازة مرضية مطولة</option>
                      <option>إجازة استشفاء</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* جهة الاتصال في حالة الطوارئ */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
            >
              <Card className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm h-full">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    جهة الاتصال الطارئة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div>
                    <Label className="text-xs sm:text-sm">الاسم</Label>
                    <Input
                      value={form.emergencyContact}
                      onChange={(e) => setField("emergencyContact", e.target.value)}
                      className="rounded-xl mt-1.5 text-sm"
                      placeholder="اسم الشخص"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">رقم الجوال</Label>
                    <Input
                      value={form.emergencyPhone}
                      onChange={(e) => setField("emergencyPhone", e.target.value)}
                      className="rounded-xl mt-1.5 text-sm"
                      placeholder="05XXXXXXXX"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* المعلومات الطبية */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    المعلومات الطبية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        التشخيص <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        value={form.diagnosis}
                        onChange={(e) => setField("diagnosis", e.target.value)}
                        className={cn("rounded-xl mt-1.5 text-sm", errors.diagnosis && "border-red-500")}
                        placeholder="التشخيص الطبي"
                      />
                      {errors.diagnosis && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.diagnosis}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">
                        اسم الطبيب <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        value={form.doctorName}
                        onChange={(e) => setField("doctorName", e.target.value)}
                        className={cn("rounded-xl mt-1.5 text-sm", errors.doctorName && "border-red-500")}
                        placeholder="د. محمد أحمد"
                      />
                      {errors.doctorName && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.doctorName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">اسم المستشفى / العيادة</Label>
                      <Input
                        value={form.hospitalName}
                        onChange={(e) => setField("hospitalName", e.target.value)}
                        className="rounded-xl mt-1.5 text-sm"
                        placeholder="مستشفى الملك فيصل"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <Label className="text-xs sm:text-sm">رقم التقرير الطبي</Label>
                      <Input
                        value={form.medicalReportNo}
                        onChange={(e) => setField("medicalReportNo", e.target.value)}
                        className="rounded-xl mt-1.5 text-sm"
                        placeholder="MR-2025-001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">ملاحظات إضافية</Label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      rows={3}
                      className="w-full rounded-xl px-3 py-2 bg-white border border-neutral-200 mt-1.5 text-sm resize-none"
                      placeholder="أي معلومات إضافية ترغب في ذكرها..."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* المرفقات */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="lg:col-span-3"
            >
              <Card className="rounded-2xl border bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    المرفقات <span className="text-red-600 text-sm">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div
                    className={cn(
                      "rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-colors",
                      errors.attachments ? "border-red-300 bg-red-50" : "border-neutral-300 bg-neutral-50/50"
                    )}
                  >
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-3">
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                      <div className="text-sm sm:text-base text-neutral-600 mb-3">
                        اسحب وأفلت التقرير الطبي هنا أو
                      </div>
                      <input
                        ref={fileInputRef}
                        onChange={(e) => onFilesSelected(e.target.files)}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        hidden
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        اختر الملفات
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF, JPG, PNG (الحد الأقصى 10 ميجابايت)
                      </p>
                    </div>

                    {errors.attachments && (
                      <div className="mt-3 p-3 rounded-xl bg-red-100 border border-red-200">
                        <p className="text-sm text-red-700 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {errors.attachments}
                        </p>
                      </div>
                    )}

                    {!!attachments.length && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{a.name}</div>
                                <div className="text-xs text-muted-foreground">{formatFileSize(a.size)}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(a.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* أزرار الإجراءات */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3"
          >
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="w-full sm:w-auto rounded-xl"
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
            >
              {saving ? (
                <>
                  <Save className="ml-2 h-4 w-4 animate-pulse" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Check className="ml-2 h-4 w-4" />
                  إرسال الطلب
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
