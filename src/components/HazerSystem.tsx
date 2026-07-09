import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Calendar, TrendingUp, User as User2, MapPin, AlertCircle, LogOut as LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "./ds/StatCard";

export default function HazerSystem() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workDuration, setWorkDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isCheckedIn && checkInTime) {
        const diff = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000);
        setWorkDuration(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, checkInTime]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
    setWorkDuration(0);
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(null);
    setWorkDuration(0);
  };

  const recentAttendance = [
    { date: "الأربعاء، 18 سبتمبر 2025", checkIn: "08:45:00", checkOut: "17:20:00", hours: "8:35" },
    { date: "الثلاثاء، 17 سبتمبر 2025", checkIn: "08:30:00", checkOut: "17:00:00", hours: "8:30" },
    { date: "الإثنين، 16 سبتمبر 2025", checkIn: "08:29:00", checkOut: "16:55:00", hours: "8:26" },
  ];

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="mx-auto max-w-[1200px] p-3 sm:p-6 space-y-4 sm:space-y-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="rounded-2xl border bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl dark:text-neutral-100">نظام حاضر</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">الموظف</div>
                  <div className="font-medium dark:text-neutral-100">أحمد عبدالقادر أحمد محي الدين</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">الموقع</div>
                  <div className="font-medium dark:text-neutral-100">المكتب الرئيسي</div>
                </div>
              </div>
              <Badge className="rounded-full bg-white/60 backdrop-blur border border-slate-200 text-slate-700 dark:bg-neutral-700/60 dark:border-neutral-600 dark:text-neutral-300">
                الرقم الوظيفي: 000045655
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70 backdrop-blur shadow-sm">
              <CardContent className="p-4 sm:p-8">
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/25 dark:to-blue-900/10">
                    <div className="text-3xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2 tabular-nums">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-sm sm:text-lg text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      {formatDate(currentTime)}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isCheckedIn ? (
                      <motion.div
                        key="check-in"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-3"
                      >
                        <Button
                          onClick={handleCheckIn}
                          className="w-full py-4 sm:py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-base sm:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <CheckCircle2 className="ml-2 h-6 w-6 sm:h-8 sm:w-8" />
                          تسجيل الحضور
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          اضغط الزر أعلاه لتسجيل حضورك اليوم
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="checked-in"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-4"
                      >
                        <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/15 dark:border-emerald-900/40">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-2 sm:p-3 rounded-lg bg-emerald-500">
                                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-xs sm:text-sm text-muted-foreground">تم تسجيل الحضور</p>
                                <p className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                  {checkInTime && formatTime(checkInTime)}
                                </p>
                              </div>
                            </div>
                            <div className="size-2 sm:size-3 rounded-full bg-emerald-500 animate-pulse"></div>
                          </div>
                          <div className="text-center p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-neutral-800/50">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">مدة العمل</p>
                            <p className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                              {formatDuration(workDuration)}
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={handleCheckOut}
                          className="w-full py-4 sm:py-6 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-base sm:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <LogOutIcon className="ml-2 h-6 w-6 sm:h-8 sm:w-8" />
                          تسجيل الانصراف
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          اضغط الزر أعلاه لتسجيل انصرافك عند مغادرة العمل
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="أيام الحضور" value="22 يوم" icon={Calendar} />
              <StatCard title="متوسط الساعات" value="8.2 ساعة" icon={Clock} />
              <StatCard title="التأخير" value="3 مرات" icon={AlertCircle} />
              <StatCard title="الساعات الإضافية" value="12 ساعة" icon={TrendingUp} />
            </div>

            <Card className="rounded-2xl border dark:border-neutral-700 bg-white/70 dark:bg-neutral-800/70 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg dark:text-neutral-100">سجل الحضور الأخير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAttendance.map((record, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-700/30 dark:to-neutral-800 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium dark:text-neutral-200">{record.date}</div>
                      <Badge className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/30">
                        <CheckCircle2 className="ml-1 h-3 w-3" />
                        حضور كامل
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">الدخول: </span>
                        <span className="font-medium tabular-nums dark:text-neutral-200">{record.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الخروج: </span>
                        <span className="font-medium tabular-nums dark:text-neutral-200">{record.checkOut}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">المدة: </span>
                        <span className="font-medium tabular-nums dark:text-neutral-200">{record.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-gradient-to-b from-amber-50/70 to-white dark:from-amber-900/15 dark:to-neutral-800 border-amber-100 dark:border-neutral-700 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-900 dark:text-amber-300 mb-1">تذكير مهم</div>
                    <div className="text-sm text-amber-800 dark:text-amber-200/80">
                      يرجى تسجيل الحضور والانصراف في المواعيد المحددة. التأخير المتكرر قد يؤثر على التقييم الشهري.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
