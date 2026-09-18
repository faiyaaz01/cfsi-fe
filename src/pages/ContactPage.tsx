import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  ShieldAlert
} from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { GlassCard } from '../components/common/GlassCard';
import { FlatCard } from '../components/common/FlatCard';
import { coursesData } from '../data/courses';
import cfsiLogo from '../assets/cfsi-logo.jpg';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(13),
  courseInterest: z.string().min(1, 'Please select a course of interest'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      courseInterest: '',
      subject: '',
      message: '',
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    // Simulate API delay
    await new Promise((res) => setTimeout(res, 800));

    // Save inquiry to localStorage for demo
    const existing = JSON.parse(localStorage.getItem('cfsi_inquiries') || '[]');
    existing.push({ ...data, receivedAt: new Date().toISOString() });
    localStorage.setItem('cfsi_inquiries', JSON.stringify(existing));

    toast.success('Inquiry Sent Successfully!', {
      description: `Thank you ${data.name}. Our admission counselor will call you on ${data.phone} within 24 hours.`
    });

    reset();
  };

  return (
    <div className="py-10 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Get in Touch"
          title="CONTACT CFSI VADODARA"
          subtitle="Have questions about admissions, batch timings, hostel facilities, or syllabus? Reach out to our campus desk or visit our drill grounds."
        />

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 sm:mb-16">
          
          {/* Left: Contact Info Card with Official CFSI Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <GlassCard hoverEffect={false} className="p-4 xs:p-6 sm:p-8 space-y-5 sm:space-y-6">
              
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-primary to-accent shadow-md shrink-0">
                  <img
                    src={cfsiLogo}
                    alt="Central Fire Safety Institute Logo"
                    className="w-full h-full object-cover rounded-full bg-white"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-gray-900 dark:text-white">
                    Campus Headquarters
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    Central Fire Safety Institute
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Our main campus features high-rise drill towers, equipment labs, smoke maze chambers, and spacious air-conditioned lecture halls.
              </p>

              {/* Specific info rows */}
              <div className="space-y-4 pt-2 border-t border-gray-200/60 dark:border-white/10">
                
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Direct Phone Numbers:</div>
                    <div className="mt-0.5 space-y-0.5">
                      <a href="tel:+917203016100" className="block text-sm font-bold text-gray-900 dark:text-white hover:text-accent">
                        +91 7203016100
                      </a>
                      <a href="tel:+919974983819" className="block text-sm font-bold text-gray-900 dark:text-white hover:text-accent">
                        +91 9974983819
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent dark:bg-accent/20 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Official Inquiries:</div>
                    <div className="mt-0.5 space-y-0.5">
                      <a href="mailto:centralfirevadodara@gmail.com" className="block text-sm font-bold text-gray-900 dark:text-white hover:text-accent">
                        centralfirevadodara@gmail.com
                      </a>
                      <a href="mailto:admissions@cfsi.co.in" className="block text-sm font-bold text-gray-900 dark:text-white hover:text-accent">
                        admissions@cfsi.co.in
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Campus Location:</div>
                    <p className="mt-0.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                      Near GIDC Industrial Zone, Waghodia Road, Vadodara, Gujarat - 390019, India.
                    </p>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Operating Hours:</div>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monday to Saturday: 9:00 AM – 6:00 PM <br />
                      <span className="text-gray-400 text-xs">Closed on Sundays & National Holidays</span>
                    </p>
                  </div>
                </div>

              </div>

              {/* Emergency Hotline Alert */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-red-900 dark:text-red-300 font-semibold">
                  For corporate industrial fire drill bookings or bulk employee safety training, call our emergency coordinator directly.
                </span>
              </div>

            </GlassCard>
          </motion.div>

          {/* Right: Contact Form (Flat Card) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <FlatCard className="p-4 xs:p-6 sm:p-10 border border-gray-200/80 dark:border-white/10 shadow-lg">
              
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Admissions & Inquiry Desk</span>
                <h2 className="text-xl xs:text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white mt-1 break-words">
                  Send Us a Message
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Fill out the form below and our admissions team will provide full fee brochures and batch schedules.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
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

                {/* Email & Course Interest */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="vikram@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Course of Interest *
                    </label>
                    <select
                      {...register('courseInterest')}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select a Course</option>
                      {coursesData.map((c) => (
                        <option key={c.id} value={c.title}>{c.title} ({c.duration})</option>
                      ))}
                      <option value="General Inquiry / Corporate Drill">General Inquiry / Corporate Drill</option>
                    </select>
                    {errors.courseInterest && (
                      <p className="text-xs text-red-500 mt-1">{errors.courseInterest.message}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    {...register('subject')}
                    placeholder="e.g. Admission inquiry for Diploma in Fire Safety Batch 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Your Message / Specific Inquiries *
                  </label>
                  <textarea
                    rows={4}
                    {...register('message')}
                    placeholder="Please mention your educational qualification, preferred batch timing, or any questions about physical training..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-accent hover:bg-accent-hover shadow-lg hover:shadow-accent/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                  </button>
                </div>

              </form>

            </FlatCard>
          </motion.div>

        </div>

        {/* Vadodara Google Map & Directions Embed */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10">
          <div className="p-4 bg-gray-100 dark:bg-[#161d27] border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Campus Map: CFSI Vadodara, Gujarat (Waghodia Road / GIDC Corridor)</span>
            </div>
            <a
              href="https://maps.google.com/?q=Vadodara+Gujarat"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-primary dark:text-primary-light hover:underline"
            >
              Open in Google Maps ↗
            </a>
          </div>
          <div className="w-full h-80 bg-gray-200 dark:bg-gray-800 relative">
            <iframe
              title="CFSI Vadodara Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118147.6820202978!2d73.10304561726084!3d22.322394747761066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc8ab91a3ddab%3A0xac39d3bfe1473fb8!2sVadodara%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
