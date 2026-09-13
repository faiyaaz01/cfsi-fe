import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Key, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface ParsedStudentRow {
  rollNo: string;
  name: string;
  birthDate: string;
  course: string;
  batch: string;
  studentPhone: string;
  fatherName: string;
  motherName: string;
  fatherPhone: string;
  motherPhone: string;
  category: string;
  aadharCard: string;
  email: string;
  presentAddress: string;
  generatedId: string;
  generatedPassword: string;
  isValid: boolean;
  validationError?: string;
}

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkStudentImportModal: React.FC<BulkStudentImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to format DOB as DDMMYYYY
  const formatDobToPassword = (rawDate: any): string => {
    if (!rawDate) return '20060101';

    // If Excel date serial number (e.g. 38942)
    if (typeof rawDate === 'number') {
      const dateObj = XLSX.SSF.parse_date_code(rawDate);
      if (dateObj) {
        const dd = String(dateObj.d).padStart(2, '0');
        const mm = String(dateObj.m).padStart(2, '0');
        const yyyy = String(dateObj.y);
        return `${dd}${mm}${yyyy}`;
      }
    }

    const str = String(rawDate).trim();

    // Check YYYY-MM-DD or YYYY/MM/DD
    const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      const yyyy = ymd[1];
      const mm = ymd[2].padStart(2, '0');
      const dd = ymd[3].padStart(2, '0');
      return `${dd}${mm}${yyyy}`;
    }

    // Check DD/MM/YYYY or DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmy) {
      const dd = dmy[1].padStart(2, '0');
      const mm = dmy[2].padStart(2, '0');
      const yyyy = dmy[3];
      return `${dd}${mm}${yyyy}`;
    }

    const digits = str.replace(/\D/g, '');
    if (digits.length === 8) {
      if (digits.startsWith('19') || digits.startsWith('20')) {
        return `${digits.slice(6, 8)}${digits.slice(4, 6)}${digits.slice(0, 4)}`;
      }
      return digits;
    }

    return digits || '20060101';
  };

  // Helper to compute Student ID from Batch & Roll No
  const formatStudentId = (batch: string, rollNo: string): string => {
    const cleanRoll = String(rollNo || '').trim();
    if (cleanRoll.length >= 5 && /^\d+$/.test(cleanRoll)) {
      return cleanRoll;
    }
    const cleanBatch = batch || 'Batch 2026-2027';
    const digits = cleanBatch.replace(/\D/g, '');
    let prefix = '2627';
    if (digits.length >= 8) {
      prefix = `${digits.slice(2, 4)}${digits.slice(6, 8)}`;
    } else if (digits.length === 4) {
      prefix = digits;
    }
    const padded = cleanRoll.length < 2 && /^\d+$/.test(cleanRoll) ? cleanRoll.padStart(2, '0') : cleanRoll;
    return `${prefix}${padded}`;
  };

  // Handle File Parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        toast.error('The uploaded file contains no data rows.');
        return;
      }

      const parsed: ParsedStudentRow[] = rawRows.map((row, index) => {
        // Normalize keys (case-insensitive & strip punctuation)
        const getVal = (aliases: string[]) => {
          for (const key of Object.keys(row)) {
            const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const alias of aliases) {
              if (normalized === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                return String(row[key]).trim();
              }
            }
          }
          return '';
        };

        const rollNo = getVal(['rollno', 'rollnumber', 'roll', 'roll_no']) || String(index + 1);
        const name = getVal(['name', 'studentname', 'fullname', 'cadetname', 'full_name']);
        const birthDate = getVal(['birthdate', 'dob', 'dateofbirth', 'birth_date']);
        const course = getVal(['course', 'program', 'coursename']) || 'Diploma In Fire Safety';
        const batch = getVal(['batch', 'session', 'batchname']) || 'Batch 2026-2027';
        const studentPhone = getVal(['studentphone', 'phone', 'phonenumber', 'mobile', 'student_phone']);
        const fatherName = getVal(['fathername', 'fathersname', 'father_name']);
        const motherName = getVal(['mothername', 'mothersname', 'mother_name']);
        const fatherPhone = getVal(['fatherphone', 'father_phone']);
        const motherPhone = getVal(['motherphone', 'mother_phone']);
        const category = getVal(['category', 'caste']) || 'General';
        const aadharCard = getVal(['aadhar', 'aadharcard', 'aadharno', 'aadhar_card']);
        const email = getVal(['email', 'emailid', 'email_id']);
        const presentAddress = getVal(['address', 'presentaddress', 'residentialaddress', 'present_address']);

        const generatedId = formatStudentId(batch, rollNo);
        const generatedPassword = formatDobToPassword(birthDate);

        const isValid = Boolean(name && birthDate);
        const validationError = !name
          ? 'Missing Student Name'
          : !birthDate
          ? 'Missing Birth Date'
          : undefined;

        return {
          rollNo,
          name,
          birthDate,
          course,
          batch,
          studentPhone,
          fatherName,
          motherName,
          fatherPhone,
          motherPhone,
          category,
          aadharCard,
          email,
          presentAddress,
          generatedId,
          generatedPassword,
          isValid,
          validationError,
        };
      });

      setParsedRows(parsed);
      const validCount = parsed.filter((r) => r.isValid).length;
      toast.success(`Successfully parsed ${parsed.length} rows (${validCount} valid).`);
    } catch (err: any) {
      toast.error('Failed to parse file: ' + (err.message || 'Invalid format'));
    }
  };

  // Download Sample Template (CSV)
  const handleDownloadTemplate = () => {
    const sampleHeaders = [
      'Roll Number',
      'Student Name',
      'Birth Date (DD/MM/YYYY)',
      'Course',
      'Batch',
      'Student Phone',
      'Father Name',
      'Mother Name',
      'Category',
      'Aadhaar Card',
      'Email ID',
      'Present Address'
    ];

    const sampleRows = [
      [
        '09',
        'Manish V. Trivedi',
        '23/10/2006',
        'Diploma In Fire Safety',
        'Batch 2026-2027',
        '+91 98980 12345',
        'Virendra Trivedi',
        'Varshaben Trivedi',
        'General',
        '4532 8901 2345',
        'manish.trivedi@gmail.com',
        'B-402, Shivalik Heights, Waghodia Road, Vadodara - 390019'
      ],
      [
        '10',
        'Priya K. Solanki',
        '15/04/2005',
        'Sub Fire Officer',
        'Batch 2026-2027',
        '+91 98234 56789',
        'Kirit Solanki',
        'Geetaben Solanki',
        'OBC',
        '7890 1234 5678',
        'priya.solanki@gmail.com',
        '12, Gokul Residency, Alkapuri, Vadodara - 390007'
      ],
      [
        '11',
        'Jaydeep S. Rathod',
        '08/12/2004',
        'Certificate In Fire Safety',
        'Batch 2026-2027',
        '+91 97123 45678',
        'Suresh Rathod',
        'Hansaben Rathod',
        'SC',
        '2345 6789 0123',
        'jaydeep.rathod@gmail.com',
        'Flat 301, Pushpak Complex, Manjalpur, Vadodara - 390011'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');
    XLSX.writeFile(wb, 'CFSI_Students_Bulk_Import_Template.csv');
    toast.success('Sample import template downloaded!');
  };

  // Submit to Backend
  const handleImportSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import. Please check name and birth date fields.');
      return;
    }

    try {
      setLoading(true);
      const payload = validRows.map((r) => ({
        rollNo: r.rollNo,
        name: r.name,
        birthDate: r.birthDate,
        course: r.course,
        batch: r.batch,
        studentPhone: r.studentPhone,
        fatherName: r.fatherName,
        motherName: r.motherName,
        fatherPhone: r.fatherPhone,
        motherPhone: r.motherPhone,
        category: r.category,
        aadharCard: r.aadharCard,
        email: r.email,
        presentAddress: r.presentAddress,
      }));

      const res = await api.bulkImportStudents(payload, 'Batch 2026-2027');
      setImportResult(res);
      toast.success(res.message);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to import students');
    } finally {
      setLoading(false);
    }
  };

  // Copy Generated Credentials to Clipboard
  const handleCopyCredentials = () => {
    if (!importResult?.students) return;
    const lines = importResult.students.map(
      (s: any) =>
        `Roll No: ${s.roll_no} | Student ID (Username): ${s.student_id} | Password: ${s.generated_password} | Name: ${s.name} | DOB: ${s.birth_date}`
    );
    const text = `CFSI Cadet Generated Login Credentials:\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#161d27] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/10 my-8 overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-gray-900 dark:text-white">
              Bulk Import Students & Auto-Create Accounts
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload a CSV or Excel (.xlsx, .xls) file. Student IDs are derived from the roll number, and passwords are automatically set to their birth dates (DDMMYYYY).
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUCCESS SUMMARY VIEW                                                      */}
        {/* ========================================================================= */}
        {importResult ? (
          <div className="space-y-6 pt-4">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {importResult.message}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Accounts are live in MongoDB and students can now log in immediately.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-50 flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-primary" />}
                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
              </button>
            </div>

            {/* Generated Accounts Table */}
            <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0 border-b border-gray-200 dark:border-white/10">
                  <tr>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Roll No</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Cadet Name</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Student ID (Username)</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Birth Date</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Generated Password</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {importResult.students?.map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-gray-800 dark:text-gray-200">{s.roll_no}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{s.name}</td>
                      <td className="p-3 font-mono font-bold text-primary">{s.student_id}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{s.birth_date}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                          <Key className="w-3 h-3" />
                          <span>{s.generated_password}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setImportResult(null);
                  setParsedRows([]);
                  setFile(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Import Another File
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* UPLOAD & PREVIEW VIEW                                                     */
          /* ========================================================================= */
          <div className="space-y-6 pt-4">
            
            {/* Top Guidance & Template Download */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
              <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                <span className="font-bold">Password Format:</span> If DOB is <code className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 font-bold text-blue-800 dark:text-blue-200">23/10/2006</code>, password is automatically generated as <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 font-bold text-amber-800 dark:text-amber-200">23102006</code>.
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-primary dark:text-primary-light hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-primary dark:hover:border-primary rounded-3xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-white/5 hover:bg-primary/5 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {file ? file.name : 'Click or Drag & Drop Student File Here'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </p>
            </div>

            {/* Live Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Live Preview: <strong className="text-primary">{parsedRows.length}</strong> Cadets Found
                    </span>
                    <span className="text-xs text-gray-400">
                      ({parsedRows.filter((r) => r.isValid).length} valid)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setParsedRows([]);
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    Clear Preview
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0 border-b border-gray-200 dark:border-white/10">
                      <tr>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">#</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Roll</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Cadet Name</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Auto Student ID</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Birth Date</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Auto Password (DDMMYYYY)</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Course</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? 'hover:bg-gray-50 dark:hover:bg-white/5' : 'bg-red-50/50 dark:bg-red-950/20'}>
                          <td className="p-2.5 text-gray-400">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-gray-800 dark:text-gray-200">{row.rollNo}</td>
                          <td className="p-2.5 font-bold text-gray-900 dark:text-white">{row.name || <span className="text-red-500 italic">Empty</span>}</td>
                          <td className="p-2.5 font-mono font-bold text-primary">{row.generatedId}</td>
                          <td className="p-2.5 text-gray-600 dark:text-gray-400">{row.birthDate || <span className="text-red-500 italic">Empty</span>}</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1 font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-[11px]">
                              <Lock className="w-3 h-3" />
                              <span>{row.generatedPassword}</span>
                            </span>
                          </td>
                          <td className="p-2.5 text-gray-500 dark:text-gray-400 truncate max-w-[130px]">{row.course}</td>
                          <td className="p-2.5">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Ready</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500" title={row.validationError}>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{row.validationError}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={loading || parsedRows.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                <span>
                  {loading
                    ? 'Creating Accounts...'
                    : `Generate Accounts (${parsedRows.filter((r) => r.isValid).length} Cadets)`}
                </span>
              </button>
            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
};
