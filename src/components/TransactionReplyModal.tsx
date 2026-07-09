import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertTriangle, CheckCircle, XCircle, Upload, FileText, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface TransactionReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (replyData: {
    action: string;
    comments: string;
    attachments: File[];
    requiresInvoice?: boolean;
  }) => void;
  transactionTitle: string;
}

const TransactionReplyModal: React.FC<TransactionReplyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transactionTitle
}) => {
  const [action, setAction] = useState<string>('');
  const [comments, setComments] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [requiresInvoice, setRequiresInvoice] = useState(false);

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

    if (!action || !comments.trim()) {
      alert('الرجاء اختيار الإجراء وكتابة التعليق');
      return;
    }

    onSubmit({
      action,
      comments,
      attachments,
      requiresInvoice: action === 'return_for_invoice'
    });

    setAction('');
    setComments('');
    setAttachments([]);
    setRequiresInvoice(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <div className="sticky top-0 bg-white dark:bg-neutral-800 px-6 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">الرد على المعاملة</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-md">{transactionTitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="rounded-xl h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">اختر الإجراء</Label>
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setAction('approve')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      action === 'approve'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10'
                    }`}
                  >
                    <CheckCircle className={`h-6 w-6 ${action === 'approve' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                    <div className="text-right flex-1">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">الموافقة</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">إعتماد الطلب ونقله للمرحلة التالية</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction('return_for_invoice')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      action === 'return_for_invoice'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
                    }`}
                  >
                    <AlertTriangle className={`h-6 w-6 ${action === 'return_for_invoice' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}`} />
                    <div className="text-right flex-1">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">إعادة لرفع فاتورة</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">طلب إرفاق فاتورة أو مستند إضافي</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction('reject')}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      action === 'reject'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-900/10'
                    }`}
                  >
                    <XCircle className={`h-6 w-6 ${action === 'reject' ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-400'}`} />
                    <div className="text-right flex-1">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-100">رفض الطلب</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">رفض الطلب مع توضيح السبب</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments" className="text-base font-semibold">
                  التعليق / الملاحظات
                  <span className="text-rose-500 mr-1">*</span>
                </Label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    action === 'return_for_invoice'
                      ? 'الرجاء إرفاق الفاتورة الأصلية أو صورة واضحة منها...'
                      : 'اكتب تعليقك أو ملاحظاتك هنا...'
                  }
                  className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 outline-none transition-all resize-none"
                  required
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">سيتم إرسال هذا التعليق إلى مقدم الطلب والجهات المعنية</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  المرفقات (اختياري)
                </Label>
                <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-6 text-center hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="reply-file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor="reply-file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">اضغط لتحميل الملفات</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">PDF, Word, Images (حد أقصى 10MB لكل ملف)</p>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-600">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{file.name}</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">({(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-8 w-8 p-0 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {action === 'return_for_invoice' && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-1">تنبيه:</p>
                    <p>سيتم إعادة المعاملة إلى مقدم الطلب لإرفاق الفاتورة المطلوبة. سيظهر طلبك في صندوق الوارد الخاص به.</p>
                  </div>
                </div>
              )}

              {action === 'approve' && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold mb-1">ملاحظة:</p>
                    <p>بعد الموافقة، سيتم نقل المعاملة تلقائياً إلى المرحلة التالية في مسار المعاملة.</p>
                  </div>
                </div>
              )}

              {action === 'reject' && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex gap-3">
                  <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-rose-800 dark:text-rose-300">
                    <p className="font-semibold mb-1">تحذير:</p>
                    <p>رفض المعاملة سيؤدي إلى إنهاء مسارها. تأكد من كتابة سبب واضح للرفض.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <Button
                  type="submit"
                  disabled={!action || !comments.trim()}
                  className="flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="ml-2 h-5 w-5" />
                  إرسال الرد
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl h-12 px-8"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionReplyModal;
