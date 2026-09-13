import React, { createContext, useContext, useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceSlot, AttendanceStatus, ResultRecord } from '../types';
import { initialAttendanceSeed } from '../data/attendance';
import { initialResultsSeed } from '../data/results';
import { api, getToken } from '../lib/api';

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

interface StudentDataContextType {
  attendance: AttendanceRecord[];
  results: ResultRecord[];
  addAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  updateAttendance: (id: string, updated: Partial<Omit<AttendanceRecord, 'id' | 'createdAt'>>) => void;
  deleteAttendance: (id: string) => void;
  setSlotAttendance: (
    certNumber: string,
    date: string,
    slot: AttendanceSlot,
    status: AttendanceStatus,
    details?: { topicOrModule?: string; remarks?: string; course?: string; markedBy?: string }
  ) => void;
  bulkMarkDaySlots: (
    date: string,
    slot: AttendanceSlot | 'All',
    status: AttendanceStatus,
    students: Array<{ certificateNumber: string; course: string }>,
    instructor?: string,
    topic?: string
  ) => void;
  clearDayAttendance: (date: string) => void;
  addResult: (record: Omit<ResultRecord, 'id' | 'createdAt'>) => void;
  updateResult: (id: string, updated: Partial<Omit<ResultRecord, 'id' | 'createdAt'>>) => void;
  deleteResult: (id: string) => void;
  getAttendanceByStudent: (certificateNumber: string) => AttendanceRecord[];
  getAttendanceByDate: (date: string) => AttendanceRecord[];
  getResultsByStudent: (certificateNumber: string) => ResultRecord[];
  getStudentAttendanceSummary: (certificateNumber: string) => AttendanceSummary;
  resetToSeed: () => void;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

const ATTENDANCE_STORAGE_KEY = 'cfsi_attendance';
const RESULTS_STORAGE_KEY = 'cfsi_results';

export const StudentDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Attendance State (Production clean, starts empty or with records saved by Admin)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any stale mock demo records from earlier runs
          return parsed.filter(
            (r: any) => !r.id?.startsWith('att-seed-') && !r.id?.startsWith('att-today-')
          );
        }
      }
    } catch (e) {
      console.error('Failed to parse attendance from localStorage', e);
    }
    return [];
  });

  // Results State (Production clean, starts empty or with records saved by Admin)
  const [results, setResults] = useState<ResultRecord[]>(() => {
    try {
      const saved = localStorage.getItem(RESULTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any stale mock demo results from earlier runs
          return parsed.filter((r: any) => !r.id?.startsWith('res-seed-') && !r.id?.startsWith('res-10') && !r.id?.startsWith('res-20') && !r.id?.startsWith('res-30'));
        }
      }
    } catch (e) {
      console.error('Failed to parse results from localStorage', e);
    }
    return [];
  });

  // Sync Attendance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
    } catch (e) {
      console.error('Failed to write attendance to localStorage', e);
    }
  }, [attendance]);

  // Sync Results to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      console.error('Failed to write results to localStorage', e);
    }
  }, [results]);

  // Fetch from backend MongoDB when authenticated
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    api.getAttendance().then((remoteAtt) => {
      if (Array.isArray(remoteAtt) && remoteAtt.length > 0) {
        setAttendance(remoteAtt);
      }
    }).catch(() => {});

    api.getResults().then((remoteRes) => {
      if (Array.isArray(remoteRes) && remoteRes.length > 0) {
        setResults(remoteRes);
      }
    }).catch(() => {});
  }, []);

  // Attendance Actions
  const addAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setAttendance((prev) => [newRecord, ...prev]);
  };

  const updateAttendance = (id: string, updated: Partial<Omit<AttendanceRecord, 'id' | 'createdAt'>>) => {
    setAttendance((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteAttendance = (id: string) => {
    setAttendance((prev) => prev.filter((item) => item.id !== id));
  };

  // Set or update a single cadet's attendance for a specific slot
  const setSlotAttendance = (
    certNumber: string,
    date: string,
    slot: AttendanceSlot,
    status: AttendanceStatus,
    details?: { topicOrModule?: string; remarks?: string; course?: string; markedBy?: string }
  ) => {
    setAttendance((prev) => {
      const normCert = certNumber.trim().toUpperCase();
      const existingIdx = prev.findIndex(
        (rec) =>
          rec.certificateNumber.toUpperCase() === normCert &&
          rec.date === date &&
          (rec.slot === slot || (!rec.slot && slot === 'Slot 1'))
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          slot,
          ...(details?.topicOrModule !== undefined ? { topicOrModule: details.topicOrModule } : {}),
          ...(details?.remarks !== undefined ? { remarks: details.remarks } : {}),
          ...(details?.markedBy !== undefined ? { markedBy: details.markedBy } : {}),
          ...(details?.course ? { course: details.course } : {}),
        };
        return updated;
      } else {
        const newRec: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          certificateNumber: certNumber,
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

    // Background sync to MongoDB backend
    api.saveAttendanceSingle({
      certificateNumber: certNumber,
      date,
      slot,
      course: details?.course || 'Fire Safety Program',
      status,
      topicOrModule: details?.topicOrModule,
      remarks: details?.remarks,
      markedBy: details?.markedBy || 'Chief Instructor Dave',
    }).catch(() => {});
  };

  // Bulk mark all or specific slots for given students on a date
  const bulkMarkDaySlots = (
    date: string,
    slot: AttendanceSlot | 'All',
    status: AttendanceStatus,
    students: Array<{ certificateNumber: string; course: string }>,
    instructor?: string,
    topic?: string
  ) => {
    const slotsToMark: AttendanceSlot[] =
      slot === 'All' ? ['Slot 1', 'Slot 2', 'Slot 3'] : [slot];

    // Background bulk sync to MongoDB backend
    const recordsToSync: any[] = [];
    students.forEach((st) => {
      slotsToMark.forEach((s) => {
        recordsToSync.push({
          certificateNumber: st.certificateNumber,
          date,
          slot: s,
          course: st.course,
          status,
          topicOrModule: topic || undefined,
          markedBy: instructor || 'Chief Instructor Dave',
        });
      });
    });
    if (recordsToSync.length > 0) {
      api.saveAttendanceBulk(recordsToSync).catch(() => {});
    }

    setAttendance((prev) => {
      let current = [...prev];

      for (const st of students) {
        const normCert = st.certificateNumber.trim().toUpperCase();
        for (const s of slotsToMark) {
          const existingIdx = current.findIndex(
            (rec) =>
              rec.certificateNumber.toUpperCase() === normCert &&
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
                certificateNumber: st.certificateNumber,
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
  };

  // Clear all attendance records on a given date
  const clearDayAttendance = (date: string) => {
    setAttendance((prev) => prev.filter((r) => r.date !== date));
  };

  // Results Actions
  const addResult = (resultData: Omit<ResultRecord, 'id' | 'createdAt'>) => {
    const newResult: ResultRecord = {
      ...resultData,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    setResults((prev) => [newResult, ...prev]);
    api.createResult(newResult).catch(() => {});
  };

  const updateResult = (id: string, updated: Partial<Omit<ResultRecord, 'id' | 'createdAt'>>) => {
    setResults((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deleteResult = (id: string) => {
    setResults((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter Getters
  const getAttendanceByStudent = (certificateNumber: string): AttendanceRecord[] => {
    const norm = certificateNumber.trim().toUpperCase();
    return attendance
      .filter((a) => a.certificateNumber.toUpperCase() === norm)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAttendanceByDate = (date: string): AttendanceRecord[] => {
    return attendance.filter((r) => r.date === date);
  };

  const getResultsByStudent = (certificateNumber: string): ResultRecord[] => {
    const norm = certificateNumber.trim().toUpperCase();
    return results.filter((r) => r.certificateNumber.toUpperCase() === norm);
  };

  const getStudentAttendanceSummary = (certificateNumber: string): AttendanceSummary => {
    const records = getAttendanceByStudent(certificateNumber);
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, percentage };
  };

  const resetToSeed = () => {
    setAttendance(initialAttendanceSeed);
    setResults(initialResultsSeed);
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initialAttendanceSeed));
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(initialResultsSeed));
  };

  return (
    <StudentDataContext.Provider
      value={{
        attendance,
        results,
        addAttendance,
        updateAttendance,
        deleteAttendance,
        setSlotAttendance,
        bulkMarkDaySlots,
        clearDayAttendance,
        addResult,
        updateResult,
        deleteResult,
        getAttendanceByStudent,
        getAttendanceByDate,
        getResultsByStudent,
        getStudentAttendanceSummary,
        resetToSeed,
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
