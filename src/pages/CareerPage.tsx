import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  X, 
  Upload, 
  ArrowRight, 
  Building,
  Flame,
  FileCheck
} from 'lucide-react';
import { jobsData } from '../data/jobs';
import { JobListing, CareerApplicationData } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';

const applicationSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(13),
  position: z.string().min(1, 'Please select a position'),
  experience: z.string().min(1, 'Please specify your experience'),
  coverLetter: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export const CareerPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      position: '',
      experience: '',
      coverLetter: '',
    }
  });

  const handleOpenApplyModal = (job: JobListing) => {
    setSelectedJob(job);
    setValue('position', job.title);
    setIsApplying(true);
  };

  const handleCloseModal = () => {
    setIsApplying(false);
    setSelectedJob(null);
    setResumeFileName('');
    reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
      toast.info(`Resume attached: ${e.target.files[0].name}`);
    }
  };

  const onSubmit = async (data: ApplicationFormValues) => {
    // Simulate submission delay
    await new Promise((res) => setTimeout(res, 800));

    // Save to localStorage for demo
    const applicationRecord: CareerApplicationData = {
      ...data,
      resumeFileName: resumeFileName || 'Not attached'
    };

    const existing = JSON.parse(localStorage.getItem('cfsi_career_applications') || '[]');
    existing.push({ ...applicationRecord, submittedAt: new Date().toISOString() });
    localStorage.setItem('cfsi_career_applications', JSON.stringify(existing));

    toast.success('Application Submitted Successfully!', {
      description: `Thank you ${data.fullName}. Our recruitment team will review your application for ${data.position} and contact you soon.`
    });

    handleCloseModal();
  };

  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Join Our Team"
          title="CAREERS AT CFSI VADODARA"
          subtitle="Be part of a prestigious fire engineering institute dedicated to training the next generation of frontline safety officers."
        />

        {/* Perks Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">Reputed Institution</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">15+ years of training leadership in Gujarat</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-accent/5 dark:bg-white/5 border border-accent/10 dark:border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">Competitive Compensation</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Industry standard salaries + annual incentives</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">Professional Growth</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Continuous technical training & certifications</p>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6 mb-16">
          {jobsData.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <FlatCard className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 group hover:border-primary/50">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  
                  {/* Left Job Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                        {job.department}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                        {job.type}
                      </span>
                    </div>

                    <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                      {job.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{job.experience}</span>
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{job.salary}</span>
                      </span>
                    </div>

                    {/* Requirements list */}
                    <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Key Requirements:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {job.requirements.map((req, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Button */}
                  <div className="shrink-0 flex lg:flex-col items-center justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => handleOpenApplyModal(job)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-accent hover:bg-accent-hover shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-gray-400 text-center">
                      Posted: {job.postedDate}
                    </span>
                  </div>

                </div>
              </FlatCard>
            </motion.div>
          ))}
        </div>

        {/* Application Modal Form */}
        <AnimatePresence>
          {isApplying && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/10"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">Career Application</span>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mt-1">
                    Apply for {selectedJob?.title || 'Position'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Please submit your credentials. Our HR department will contact shortlisted candidates.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="e.g. Ramesh K. Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="you@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Position & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                        Selected Position *
                      </label>
                      <select
                        {...register('position')}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Select a Role</option>
                        {jobsData.map((j) => (
                          <option key={j.id} value={j.title}>{j.title}</option>
                        ))}
                      </select>
                      {errors.position && (
                        <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                        Relevant Experience *
                      </label>
                      <input
                        type="text"
                        {...register('experience')}
                        placeholder="e.g. 3 Years in Fire Brigade"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {errors.experience && (
                        <p className="text-xs text-red-500 mt-1">{errors.experience.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Resume Upload Simulator */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Upload Resume / CV (PDF / DOCX)
                    </label>
                    <label className="border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-accent dark:hover:border-accent rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-white/5 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-primary dark:text-primary-light">
                        {resumeFileName ? resumeFileName : 'Click to select resume file from device'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">PDF, DOC, DOCX up to 5MB</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Cover letter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Brief Cover Letter / Introduction (Optional)
                    </label>
                    <textarea
                      rows={3}
                      {...register('coverLetter')}
                      placeholder="Highlight your relevant certifications, past drill experience, and joining notice period..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
