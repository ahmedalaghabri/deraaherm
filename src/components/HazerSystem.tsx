import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Calendar, TrendingUp, User as User2, MapPin, AlertCircle, LogOut as LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

function parseStatValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseFloat(match[1]), suffix: match[2] ? " " + match[2].trim() : "" };
}

function StatCard({ title, value, icon: Icon, tone = "sky" }: { title: string; value: string; icon: React.ElementType; tone?: "sky" | "emerald" | "amber" | "rose" }) {
  const toneClasses = {
    sky: "bg-white border-neutral-100",
    emerald: "bg-white border-neutral-100",
    amber: "bg-white border-neutral-100",
    rose: "bg-white border-neutral-100",
  };

  const iconToneClasses = {
    sky: "bg-sky-100/60 text-sky-700 border-sky-200",
    emerald: "bg-emerald-100/60 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100/60 text-amber-700 border-amber-200",
    rose: "bg-rose-100/60 text-rose-700 border-rose-200",
  };

  const { num, suffix } = parseStatValue(value);
  const animated = useCountUp(num);
  const displayValue = Number.isInteger(num)
    ? `${Math.round(animated)}${suffix}`
    : `${animated.toFixed(1)}${suffix}`;

  return (
    <Card className={cn("rounded-2xl border shadow-sm", toneClasses[tone])}>
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className={cn("grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl border", iconToneClasses[tone])}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="text-lg sm:text-2xl font-bold tabular-nums">{displayValue}</div>
      </CardContent>
    </Card>
  );
}

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
          <Card className="rounded-2xl border bg-white border-neutral-100 shadow-sm">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">نظام حاضر</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">الموظف</div>
                  <div className="font-medium">أحمد عبدالقادر أحمد محي الدين</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">الموقع</div>
                  <div className="font-medium">المكتب الرئيسي</div>
                </div>
              </div>
              <Badge className="rounded-full bg-white/60 backdrop-blur border border-slate-200 text-slate-700">
                الرقم الوظيفي: 000045655
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
              <CardContent className="p-4 sm:p-8">
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-3xl sm:text-5xl font-bold text-blue-600 mb-2 tabular-nums">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-sm sm:text-lg text-neutral-700 flex items-center justify-center gap-2">
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
                        <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-2 sm:p-3 rounded-lg bg-emerald-500">
                                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-xs sm:text-sm text-muted-foreground">تم تسجيل الحضور</p>
                                <p className="text-lg sm:text-2xl font-bold text-emerald-700 tabular-nums">
                                  {checkInTime && formatTime(checkInTime)}
                                </p>
                              </div>
                            </div>
                            <div className="size-2 sm:size-3 rounded-full bg-emerald-500 animate-pulse"></div>
                          </div>
                          <div className="text-center p-3 sm:p-4 rounded-xl bg-white/50">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">مدة العمل</p>
                            <p className="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
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
              <StatCard title="أيام الحضور" value="22 يوم" icon={Calendar} tone="emerald" />
              <StatCard title="متوسط الساعات" value="8.2 ساعة" icon={Clock} tone="sky" />
              <StatCard title="التأخير" value="3 مرات" icon={AlertCircle} tone="amber" />
              <StatCard title="الساعات الإضافية" value="12 ساعة" icon={TrendingUp} tone="rose" />
            </div>

            <Card className="rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">سجل الحضور الأخير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAttendance.map((record, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 bg-gradient-to-r from-neutral-50 to-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{record.date}</div>
                      <Badge className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                        <CheckCircle2 className="ml-1 h-3 w-3" />
                        حضور كامل
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">الدخول: </span>
                        <span className="font-medium tabular-nums">{record.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الخروج: </span>
                        <span className="font-medium tabular-nums">{record.checkOut}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">المدة: </span>
                        <span className="font-medium tabular-nums">{record.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-gradient-to-b from-amber-50/70 to-white border-amber-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-900 mb-1">تذكير مهم</div>
                    <div className="text-sm text-amber-800">
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
