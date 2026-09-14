import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AttendanceRecord, AttendanceSlot, AttendanceStatus } from '../types';
import { api, getToken, getAttendanceStreamUrl } from '../lib/api';

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

interface StudentDataContextType {
  attendance: AttendanceRecord[];
  loading: boolean;
  addAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateAttendance: (id: string, updated: Partial<Omit<AttendanceRecord, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAttendance: (id: string) => Promise<void>;
  setSlotAttendance: (
    studentId: string,
    date: string,
    slot: AttendanceSlot,
    status: AttendanceStatus,
    details?: { topicOrModule?: string; remarks?: string; course?: string; markedBy?: string; rollNo?: string }
  ) => Promise<void>;
  bulkMarkDaySlots: (
    date: string,
    slot: AttendanceSlot | 'All',
    status: AttendanceStatus,
    students: Array<{ studentId: string; course: string; rollNo?: string }>,
    instructor?: string,
    topic?: string
  ) => Promise<void>;
  uploadDayAttendance: (
    date: string,
    records: Array<{
      studentId: string;
      rollNo?: string;
      slot: AttendanceSlot;
      status: AttendanceStatus;
      course: string;
      topicOrModule?: string;
      remarks?: string;
      markedBy?: string;
    }>
  ) => Promise<AttendanceRecord[]>;
  clearDayAttendance: (date: string) => Promise<void>;
  getAttendanceByStudent: (studentId: string) => AttendanceRecord[];
  getAttendanceByDate: (date: string) => AttendanceRecord[];
  getStudentAttendanceSummary: (studentId: string) => AttendanceSummary;
  isDateLocked: (date: string) => { locked: boolean; uploadedAt?: string; canEditUntil?: string; remainingHours?: number };
  resetToSeed: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure MongoDB Database State - No localStorage persistence
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch attendance records from backend MongoDB
  const fetchAttendance = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAttendance([]);
      return;
    }
    try {
      setLoading(true);
      const remoteAtt = await api.getAttendance();
      if (Array.isArray(remoteAtt)) {
        setAttendance(remoteAtt);
      }
    } catch (err) {
      console.error('Failed to load attendance from MongoDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize and listen to auth changes & real-time SSE updates
  useEffect(() => {
    // Purge any legacy localStorage attendance keys
    try {
      localStorage.removeItem('cfsi_attendance');
    } catch {}

    void fetchAttendance();

    const handleAuthSync = () => {
      void fetchAttendance();
    };

    window.addEventListener('storage', handleAuthSync);
    window.addEventListener('auth-cleared', handleAuthSync);
    window.addEventListener('focus', handleAuthSync);
    window.addEventListener('attendance-refresh', handleAuthSync);

    // Real-time Server-Sent Events (SSE) Stream Subscription
    let eventSource: EventSource | null = null;
    try {
      const streamUrl = getAttendanceStreamUrl();
      eventSource = new EventSource(streamUrl);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'attendance_updated' || data.event === 'attendance_deleted') {
            void fetchAttendance();
          }
        } catch {
          // ignore keepalive/ping
        }
      };
      eventSource.onerror = () => {
        // SSE will reconnect automatically
      };
    } catch (e) {
      console.warn('Real-time attendance stream unavailable:', e);
    }

    // Secondary heartbeat fallback poll (every 10s if window is active)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible' && getToken()) {
        void fetchAttendance();
      }
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleAuthSync);
      window.removeEventListener('auth-cleared', handleAuthSync);
      window.removeEventListener('focus', handleAuthSync);
      window.removeEventListener('attendance-refresh', handleAuthSync);
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(intervalId);
    };
  }, [fetchAttendance]);

  // Attendance Actions - Directly wired to MongoDB
  const addAttendance = async (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const tempId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const tempRecord: AttendanceRecord = {
      ...recordData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setAttendance((prev) => [tempRecord, ...prev]);

    try {
      const saved = await api.saveAttendanceSingle(tempRecord);
      if (saved && saved.id) {
        setAttendance((prev) =>
          prev.map((item) => (item.id === tempId ? saved : item))
        );
      }
    } catch (err) {
      console.error('Failed to save attendance record to MongoDB:', err);
      void fetchAttendance();
    }
  };

  const updateAttendance = async (id: string, updated: Partial<Omit<AttendanceRecord, 'id' | 'createdAt'>>) => {
    setAttendance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    try {
      const saved = await api.updateAttendance(id, updated);
      if (saved && saved.id) {
        setAttendance((prev) =>
          prev.map((item) => (item.id === id ? saved : item))
        );
      }
    } catch (err) {
      console.error('Failed to update attendance in MongoDB:', err);
      void fetchAttendance();
    }
  };

  const deleteAttendance = async (id: string) => {
    setAttendance((prev) => prev.filter((item) => item.id !== id));

    try {
      await api.deleteAttendance(id);
    } catch (err) {
      console.error('Failed to delete attendance record from MongoDB:', err);
      void fetchAttendance();
    }
  };

  // Set or update a single cadet's attendance for a specific slot in MongoDB
  const setSlotAttendance = async (
    studentId: string,
    date: string,
    slot: AttendanceSlot,
    status: AttendanceStatus,
    details?: { topicOrModule?: string; remarks?: string; course?: string; markedBy?: string; rollNo?: string }
  ) => {
    const payload = {
      studentId: studentId.trim(),
      rollNo: details?.rollNo,
      date,
      slot,
      course: details?.course || 'Fire Safety Program',
      status,
      topicOrModule: details?.topicOrModule,
      remarks: details?.remarks,
      markedBy: details?.markedBy || 'Chief Instructor Dave',
    };

    // Optimistically update React state
    setAttendance((prev) => {
      const normId = studentId.trim().toUpperCase();
      const existingIdx = prev.findIndex(
        (rec) =>
          (rec.studentId.toUpperCase() === normId || (details?.rollNo && rec.rollNo === details.rollNo)) &&
          rec.date === date &&
          (rec.slot === slot || (!rec.slot && slot === 'Slot 1'))
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          slot,
          studentId: normId,
          ...(details?.rollNo ? { rollNo: details.rollNo } : {}),
          ...(details?.topicOrModule !== undefined ? { topicOrModule: details.topicOrModule } : {}),
          ...(details?.remarks !== undefined ? { remarks: details.remarks } : {}),
          ...(details?.markedBy !== undefined ? { markedBy: details.markedBy } : {}),
          ...(details?.course ? { course: details.course } : {}),
        };
        return updated;
      } else {
        const newRec: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: normId,
          rollNo: details?.rollNo,
          date,
          slot,
          course: details?.course || 'Fire Safety Program',
          status,
          topicOrModule: details?.topicOrModule || undefined,
          remarks: details?.remarks || undefined,
          markedBy: details?.markedBy || 'Chief Instructor Dave',
          createdAt: new Date().toISOString(),
        };
        return [newRec, ...prev];
      }
    });

    // Persist directly to MongoDB
    try {
      const saved = await api.saveAttendanceSingle(payload);
      if (saved && saved.id) {
        setAttendance((prev) => {
          const normId = studentId.trim().toUpperCase();
          return prev.map((rec) => {
            if (rec.studentId.toUpperCase() === normId && rec.date === date && rec.slot === slot) {
              return saved;
            }
            return rec;
          });
        });
      }
    } catch (err) {
      console.error('Failed to sync slot attendance to MongoDB:', err);
    }
  };

  // Bulk mark all or specific slots for given students on a date in MongoDB
  const bulkMarkDaySlots = async (
    date: string,
    slot: AttendanceSlot | 'All',
    status: AttendanceStatus,
    students: Array<{ studentId: string; course: string; rollNo?: string }>,
    instructor?: string,
    topic?: string
  ) => {
    const slotsToMark: AttendanceSlot[] =
      slot === 'All' ? ['Slot 1', 'Slot 2', 'Slot 3'] : [slot];

    const recordsToSync: any[] = [];
    students.forEach((st) => {
      slotsToMark.forEach((s) => {
        recordsToSync.push({
          studentId: st.studentId,
          rollNo: st.rollNo,
          date,
          slot: s,
          course: st.course,
          status,
          topicOrModule: topic || undefined,
          markedBy: instructor || 'Chief Instructor Dave',
        });
      });
    });

    // Optimistic UI update
    setAttendance((prev) => {
      let current = [...prev];

      for (const st of students) {
        const normId = st.studentId.trim().toUpperCase();
        for (const s of slotsToMark) {
          const existingIdx = current.findIndex(
            (rec) =>
              (rec.studentId.toUpperCase() === normId || (st.rollNo && rec.rollNo === st.rollNo)) &&
              rec.date === date &&
              (rec.slot === s || (!rec.slot && s === 'Slot 1'))
          );

          if (existingIdx >= 0) {
            current[existingIdx] = {
              ...current[existingIdx],
              status,
              slot: s,
              ...(topic ? { topicOrModule: topic } : {}),
              ...(instructor ? { markedBy: instructor } : {}),
            };
          } else {
            current = [
              {
                id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                studentId: st.studentId,
                rollNo: st.rollNo,
                date,
                slot: s,
                course: st.course,
                status,
                topicOrModule: topic || undefined,
                markedBy: instructor || 'Chief Instructor Dave',
                createdAt: new Date().toISOString(),
              },
              ...current,
            ];
          }
        }
      }

      return current;
    });

    // Persist directly to MongoDB
    if (recordsToSync.length > 0) {
      try {
        const saved = await api.saveAttendanceBulk(recordsToSync);
        if (Array.isArray(saved) && saved.length > 0) {
          setAttendance((prev) => {
            const copy = [...prev];
            saved.forEach((sv) => {
              const idx = copy.findIndex(
                (r) =>
                  r.studentId.toUpperCase() === sv.studentId.toUpperCase() &&
                  r.date === sv.date &&
                  r.slot === sv.slot
              );
              if (idx >= 0) {
                copy[idx] = sv;
              } else {
                copy.unshift(sv);
              }
            });
            return copy;
          });
        }
      } catch (err) {
        console.error('Failed to bulk save attendance to MongoDB:', err);
      }
    }
  };

  // Upload and commit whole day muster to MongoDB with 24-hour timestamp
  const uploadDayAttendance = async (
    date: string,
    records: Array<{
      studentId: string;
      rollNo?: string;
      slot: AttendanceSlot;
      status: AttendanceStatus;
      course: string;
      topicOrModule?: string;
      remarks?: string;
      markedBy?: string;
    }>
  ): Promise<AttendanceRecord[]> => {
    const recordsToSync = records.map((r) => ({
      ...r,
      date,
      uploadedAt: new Date().toISOString(),
    }));

    const saved = await api.saveAttendanceBulk(recordsToSync);
    if (Array.isArray(saved) && saved.length > 0) {
      setAttendance((prev) => {
        const copy = [...prev.filter((r) => r.date !== date)];
        return [...saved, ...copy];
      });
    }
    return saved;
  };

  // Check whether attendance records for a specific date are locked (> 24h since upload)
  const isDateLocked = useCallback((date: string): { locked: boolean; uploadedAt?: string; canEditUntil?: string; remainingHours?: number } => {
    const dayRecords = attendance.filter((r) => r.date === date);
    if (dayRecords.length === 0) {
      return { locked: false };
    }

    // Direct flag from backend
    const lockedRecord = dayRecords.find((r) => r.isLocked);
    if (lockedRecord) {
      return {
        locked: true,
        uploadedAt: lockedRecord.uploadedAt,
        canEditUntil: lockedRecord.canEditUntil,
        remainingHours: 0,
      };
    }

    // Check earliest upload timestamp
    const uploadedRecords = dayRecords.filter((r) => r.uploadedAt);
    if (uploadedRecords.length > 0) {
      const earliestUpload = uploadedRecords.reduce((min, r) => {
        const t = new Date(r.uploadedAt!).getTime();
        return t < min ? t : min;
      }, Infinity);

      if (earliestUpload !== Infinity) {
        const deadline = earliestUpload + 24 * 60 * 60 * 1000;
        const now = Date.now();
        const diffMs = deadline - now;
        if (diffMs <= 0) {
          return {
            locked: true,
            uploadedAt: new Date(earliestUpload).toISOString(),
            canEditUntil: new Date(deadline).toISOString(),
            remainingHours: 0,
          };
        }
        const remainingHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
        return {
          locked: false,
          uploadedAt: new Date(earliestUpload).toISOString(),
          canEditUntil: new Date(deadline).toISOString(),
          remainingHours,
        };
      }
    }

    return { locked: false };
  }, [attendance]);

  // Clear all attendance records on a given date from MongoDB
  const clearDayAttendance = async (date: string) => {
    setAttendance((prev) => prev.filter((r) => r.date !== date));

    try {
      await api.clearDayAttendance(date);
    } catch (err) {
      console.error('Failed to clear day attendance from MongoDB:', err);
      void fetchAttendance();
    }
  };

  // Filter Getters
  const getAttendanceByStudent = (studentId: string): AttendanceRecord[] => {
    const norm = studentId.trim().toUpperCase();
    return attendance
      .filter((a) => a.studentId.toUpperCase() === norm || (a.rollNo && a.rollNo.toUpperCase() === norm))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAttendanceByDate = (date: string): AttendanceRecord[] => {
    return attendance.filter((r) => r.date === date);
  };

  const getStudentAttendanceSummary = (studentId: string): AttendanceSummary => {
    const records = getAttendanceByStudent(studentId);
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const na = records.filter((r) => r.status === 'NA').length;
    const countable = total - na;
    const absent = Math.max(0, countable - present);
    const percentage = countable > 0 ? Math.round((present / countable) * 100) : (total > 0 && na === total ? 100 : 0);
    return { total, present, absent, percentage };
  };

  // Wipe attendance in MongoDB database
  const resetToSeed = async () => {
    setAttendance([]);
    try {
      await api.clearAllAttendance();
    } catch (err) {
      console.error('Failed to clear all attendance from MongoDB:', err);
      void fetchAttendance();
    }
  };

  const refreshAttendance = async () => {
    await fetchAttendance();
  };

  return (
    <StudentDataContext.Provider
      value={{
        attendance,
        loading,
        addAttendance,
        updateAttendance,
        deleteAttendance,
        setSlotAttendance,
        bulkMarkDaySlots,
        uploadDayAttendance,
        clearDayAttendance,
        getAttendanceByStudent,
        getAttendanceByDate,
        getStudentAttendanceSummary,
        isDateLocked,
        resetToSeed,
        refreshAttendance,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = (): StudentDataContextType => {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};
