import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  enrollmentNo?: string;
  gender?: string;
  centerName?: string;
  mode?: string;
  nationality?: string;
  state?: string;
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

  // Helper to format Aadhar card numbers (converts Excel scientific notation like 9.69E+11 to plain digits)
  const formatAadhar = (rawVal: any, formattedVal?: any): string => {
    if (typeof rawVal === 'number' && !isNaN(rawVal)) {
      return Math.round(rawVal).toString();
    }
    const val = String(formattedVal || rawVal || '').trim();
    if (val.includes('e+') || val.includes('E+')) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        return Math.round(num).toString();
      }
    }
    return val;
  };

  // Helper to parse any Excel/CSV date format into DD-MM-YYYY display and DDMMYYYY password
  const parseDateAndGeneratePassword = (
    rawVal: any,
    formattedVal?: any
  ): { birthDate: string; password: string } => {
    const formattedStr = typeof formattedVal === 'string' ? formattedVal.trim() : '';
    const rawStr =
      typeof rawVal === 'string'
        ? rawVal.trim()
        : typeof rawVal === 'number'
        ? String(rawVal)
        : '';

    // 1. If text string matches standard date formats
    for (const candidate of [rawStr, formattedStr]) {
      if (!candidate) continue;

      // Match DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
      const dmy = candidate.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (dmy) {
        const p1 = parseInt(dmy[1], 10);
        const p2 = parseInt(dmy[2], 10);
        const yyyy = dmy[3];

        let dd = p1;
        let mm = p2;
        // If second part > 12 and first <= 12, it was MM-DD-YYYY
        if (p2 > 12 && p1 <= 12) {
          dd = p2;
          mm = p1;
        }

        const ddStr = String(dd).padStart(2, '0');
        const mmStr = String(mm).padStart(2, '0');
        return {
          birthDate: `${ddStr}-${mmStr}-${yyyy}`,
          password: `${ddStr}${mmStr}${yyyy}`,
        };
      }

      // Match YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
      const ymd = candidate.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (ymd) {
        const yyyy = ymd[1];
        const mm = String(parseInt(ymd[2], 10)).padStart(2, '0');
        const dd = String(parseInt(ymd[3], 10)).padStart(2, '0');
        return {
          birthDate: `${dd}-${mm}-${yyyy}`,
          password: `${dd}${mm}${yyyy}`,
        };
      }
    }

    // 2. Check if rawVal or candidate is an Excel serial date number (e.g. 36474.00011574074 or 36474)
    const num = typeof rawVal === 'number' ? rawVal : parseFloat(rawStr || formattedStr);
    if (!isNaN(num) && num > 1000 && num < 100000) {
      try {
        const dateObj = XLSX.SSF.parse_date_code(num);
        if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
          const ddStr = String(dateObj.d).padStart(2, '0');
          const mmStr = String(dateObj.m).padStart(2, '0');
          const yyyy = String(dateObj.y);
          return {
            birthDate: `${ddStr}-${mmStr}-${yyyy}`,
            password: `${ddStr}${mmStr}${yyyy}`,
          };
        }
      } catch {
        // Fallthrough
      }
    }

    // 3. Check 8 consecutive digits
    for (const candidate of [rawStr, formattedStr]) {
      const digits = candidate.replace(/\D/g, '');
      if (digits.length === 8) {
        if (digits.startsWith('19') || digits.startsWith('20')) {
          // YYYYMMDD
          const yyyy = digits.slice(0, 4);
          const mm = digits.slice(4, 6);
          const dd = digits.slice(6, 8);
          return {
            birthDate: `${dd}-${mm}-${yyyy}`,
            password: `${dd}${mm}${yyyy}`,
          };
        }
        // DDMMYYYY
        const dd = digits.slice(0, 2);
        const mm = digits.slice(2, 4);
        const yyyy = digits.slice(4, 8);
        return {
          birthDate: `${dd}-${mm}-${yyyy}`,
          password: digits,
        };
      }
    }

    // 4. Default fallback
    const fallback = formattedStr || rawStr || '';
    const digitsOnly = fallback.replace(/\D/g, '');
    return {
      birthDate: fallback,
      password: digitsOnly.length >= 8 ? digitsOnly.slice(0, 8) : '20060101',
    };
  };

  // Helper to compute Cadet User ID from Batch/Year & Roll No (e.g. 262701)
  const formatStudentId = (batch: string, rollNo: string): string => {
    const cleanRoll = String(rollNo || '').trim();
    const cleanBatch = String(batch || 'Batch 2026-2027').trim();
    const digits = cleanBatch.replace(/\D/g, '');
    let prefix = '2627';
    if (digits.length >= 8) {
      prefix = `${digits.slice(2, 4)}${digits.slice(6, 8)}`;
    } else if (digits.length === 4) {
      prefix = digits;
    }
    const padded = cleanRoll.length < 2 && /^\d+$/.test(cleanRoll) ? cleanRoll.padStart(2, '0') : cleanRoll;
    return `${prefix}${padded || '01'}`;
  };

  // Handle File Parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);
    try {
      const data = await selectedFile.arrayBuffer();
      const isCsv =
        selectedFile.name.toLowerCase().endsWith('.csv') ||
        selectedFile.name.toLowerCase().endsWith('.tsv');
      const workbook = XLSX.read(data, {
        type: 'array',
        cellDates: false,
        cellNF: true,
        cellText: true,
        dateNF: 'dd-mm-yyyy',
        raw: isCsv,
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' });
      const formattedRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        dateNF: 'dd-mm-yyyy',
      });

      if (rawRows.length === 0) {
        toast.error('The uploaded file contains no data rows.');
        return;
      }

      const parsed: ParsedStudentRow[] = rawRows.map((row, index) => {
        const formattedRow = formattedRows[index] || {};

        // Normalize keys (case-insensitive & strip punctuation)
        const getVal = (aliases: string[], fromFormatted = false) => {
          const target = fromFormatted ? formattedRow : row;
          for (const key of Object.keys(target)) {
            const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const alias of aliases) {
              if (normalized === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                return target[key];
              }
            }
          }
          return '';
        };

        const enrollmentNo = String(
          getVal([
            'enrollmentno',
            'enrollmentnumber',
            'enrollment',
            'enrollno',
            'enroll_no',
            'student_id',
            'enrollment_no'
          ]) || ''
        ).trim();

        const sessionYear = String(
          getVal(['sessionyear', 'session_year', 'session', 'year', 'batch']) || ''
        ).trim();

        const explicitRoll = String(
          getVal(['rollno', 'rollnumber', 'roll', 'roll_no']) || ''
        ).trim();
        const rollNo = explicitRoll || String(index + 1);

        const name = String(
          getVal(['name', 'studentname', 'fullname', 'cadetname', 'full_name']) || ''
        ).trim();

        // Retrieve both raw value (e.g. 36474.00011574074) and formatted string (e.g. "11-10-1999")
        const rawDob = getVal(['dob', 'birthdate', 'dateofbirth', 'birth_date'], false);
        const formattedDob = getVal(['dob', 'birthdate', 'dateofbirth', 'birth_date'], true);
        const { birthDate, password: generatedPassword } = parseDateAndGeneratePassword(
          rawDob,
          formattedDob
        );

        const course =
          String(getVal(['coursename', 'course_name', 'course', 'program']) || '').trim() ||
          'DIPLOMA IN FIRE AND SAFETY MANAGEMENT';

        const batch = sessionYear || String(getVal(['batch', 'session', 'batchname']) || '').trim() || 'Batch 2026-2027';

        const studentPhone = String(
          getVal([
            'contactdetails',
            'contact_details',
            'contact',
            'contactno',
            'contactnumber',
            'studentphone',
            'phone',
            'phonenumber',
            'mobile',
            'student_phone',
          ]) || ''
        ).trim();

        const fatherName = String(
          getVal(['fathername', 'fathersname', 'father_name']) || ''
        ).trim();

        const motherName = String(
          getVal(['mothername', 'mothersname', 'mother_name']) || ''
        ).trim();

        const fatherPhone = String(
          getVal(['fatherphone', 'father_phone']) || ''
        ).trim();

        const motherPhone = String(
          getVal(['motherphone', 'mother_phone']) || ''
        ).trim();

        const gender = String(getVal(['gender', 'sex']) || '').trim() || 'MALE';

        const category =
          String(getVal(['category', 'caste']) || '').trim() || 'General';

        const rawAadhar = getVal(['aadharcard', 'aadhar_card', 'aadhar', 'aadharno'], false);
        const formattedAadhar = getVal(['aadharcard', 'aadhar_card', 'aadhar', 'aadharno'], true);
        const aadharCard = formatAadhar(rawAadhar, formattedAadhar);

        const centerName = String(
          getVal(['centername', 'center_name', 'center', 'trainingcenter', 'centerlocation', 'center_location']) || ''
        ).trim() || 'CENTRAL FIRE AND SAFETY INSTITUTE';

        const mode = String(
          getVal(['moderegcorrespo', 'mode', 'trainingmode', 'studymode']) || ''
        ).trim() || 'REGULAR';

        const email = String(getVal(['emailid', 'email_id', 'email']) || '').trim();

        const presentAddress = String(
          getVal(['presentaddress', 'present_address', 'address', 'residentialaddress']) || ''
        ).trim();

        const nationality = String(getVal(['nationality']) || '').trim() || 'INDIAN';
        const state = String(getVal(['state']) || '').trim() || 'GUJARAT';

        // Assign Cadet User ID automatically as per roll (e.g. 202601)
        const cadetUserId = formatStudentId(batch, rollNo);
        const generatedId = cadetUserId;

        const isValid = Boolean(name && birthDate && birthDate.length >= 8);
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
          enrollmentNo,
          gender,
          centerName,
          mode,
          nationality,
          state,
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
      'Roll No',
      'Session/Year',
      'Student Name',
      'Father Name',
      'Mother Name',
      'Present Address',
      'Contact Details',
      'DOB',
      'Gender',
      'Category',
      'Aadhar Card',
      'Center Name',
      'Course Name',
      'Mode (Reg/Correspo)',
      'Email ID',
      'Nationality',
      'STATE',
    ];

    const sampleRows = [
      [
        '1',
        '2026-2027',
        'AMBHIRE RUSHIKESH',
        'AMBHIRE KAMLESH',
        'AMBHIRE ANKUSHI',
        'Tadgaam-Mangelav, Tal. Umbergaon, Dist. Valsad, Gujarat - 396170',
        '9327904526',
        '11-10-1999',
        'MALE',
        'General',
        '969123456789',
        'CENTRAL FIRE AND SAFETY INSTITUTE',
        'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
        'REGULAR',
        'rushiambhire5@gmail.com',
        'INDIAN',
        'GUJARAT',
      ],
      [
        '2',
        '2026-2027',
        'PRIYA K. SOLANKI',
        'KIRIT SOLANKI',
        'GEETABEN SOLANKI',
        '12, Gokul Residency, Alkapuri, Vadodara - 390007',
        '9823456789',
        '15-04-2005',
        'FEMALE',
        'OBC',
        '789012345678',
        'CENTRAL FIRE AND SAFETY INSTITUTE',
        'SUB FIRE OFFICER',
        'REGULAR',
        'priya.solanki@gmail.com',
        'INDIAN',
        'GUJARAT',
      ],
      [
        '3',
        '2026-2027',
        'JAYDEEP S. RATHOD',
        'SURESH RATHOD',
        'HANSABEN RATHOD',
        'Flat 301, Pushpak Complex, Manjalpur, Vadodara - 390011',
        '9712345678',
        '08-12-2004',
        'MALE',
        'SC',
        '234567890123',
        'CENTRAL FIRE AND SAFETY INSTITUTE',
        'CERTIFICATE IN FIRE AND SAFETY',
        'REGULAR',
        'jaydeep.rathod@gmail.com',
        'INDIAN',
        'GUJARAT',
      ],
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
        studentId: r.generatedId,
        enrollmentNo: r.generatedId,
        sessionYear: r.batch,
        name: r.name,
        birthDate: r.birthDate,
        gender: r.gender,
        course: r.course,
        batch: r.batch,
        studentPhone: r.studentPhone,
        fatherName: r.fatherName,
        motherName: r.motherName,
        fatherPhone: r.fatherPhone,
        motherPhone: r.motherPhone,
        category: r.category,
        aadharCard: r.aadharCard,
        centerName: r.centerName,
        centerLocation: r.centerName,
        mode: r.mode,
        email: r.email,
        presentAddress: r.presentAddress,
        nationality: r.nationality,
        state: r.state,
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
        `Roll No: ${s.roll_no} | Student User ID (Login): ${s.student_id} | Password: ${s.generated_password} | Name: ${s.name} | DOB: ${s.birth_date}`
    );
    const text = `CFSI Student Generated Login Credentials:\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#161d27] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/10 my-8 overflow-hidden relative">
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
              Upload a CSV or Excel (.xlsx, .xls) file. Student User IDs (e.g. 262701) are automatically assigned by roll number for login, and passwords are set to birth dates (DDMMYYYY).
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
                    Accounts are live in MongoDB and students can now log in immediately with their Student User ID.
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
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Student User ID (Login)</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Student Name</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Birth Date</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Generated Password</th>
                    <th className="p-3 font-bold text-gray-600 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {importResult.students?.map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-gray-800 dark:text-gray-200">{s.roll_no}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{s.student_id}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{s.name}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{s.birth_date}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2 py-0.5 rounded border border-primary/20">
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
                      Live Preview: <strong className="text-primary">{parsedRows.length}</strong> Students Found
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
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Student User ID</th>
                        <th className="p-2.5 font-bold text-gray-600 dark:text-gray-300">Student Name</th>
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
                          <td className="p-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {row.generatedId}
                          </td>
                          <td className="p-2.5 font-bold text-gray-900 dark:text-white">{row.name || <span className="text-red-500 italic">Empty</span>}</td>
                          <td className="p-2.5 text-gray-600 dark:text-gray-400">{row.birthDate || <span className="text-red-500 italic">Empty</span>}</td>
                          <td className="p-2.5">
                            <span className="inline-flex items-center gap-1 font-mono font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2 py-0.5 rounded text-[11px] border border-primary/20">
                              <Lock className="w-3 h-3" />
                              <span>{row.generatedPassword}</span>
                            </span>
                          </td>
                          <td className="p-2.5 text-gray-500 dark:text-gray-400 truncate max-w-[130px]">
                            <div>{row.course}</div>
                            {row.mode && <span className="text-[10px] text-gray-400">({row.mode})</span>}
                          </td>
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
                    : `Generate Accounts (${parsedRows.filter((r) => r.isValid).length} Students)`}
                </span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
