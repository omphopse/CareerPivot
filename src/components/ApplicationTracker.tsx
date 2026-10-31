import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Trash2,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  MapPin,
  X,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';

interface ApplicationTrackerProps {
  applications: JobApplication[];
  onUpdateApplications: (apps: JobApplication[]) => void;
  onDeleteApplication?: (appId: string) => void;
}

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { id: 'wishlist', label: 'Wishlist', color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700/60' },
  { id: 'applied', label: 'Applied', color: 'text-cyan-400', bg: 'bg-cyan-950/20 border-cyan-500/30' },
  { id: 'interviewing', label: 'Interviewing', color: 'text-indigo-400', bg: 'bg-indigo-950/25 border-indigo-500/40' },
  { id: 'offer', label: 'Offer Received', color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-500/30' },
  { id: 'rejected', label: 'Archive / Passed', color: 'text-rose-400', bg: 'bg-rose-950/20 border-rose-500/30' }
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateApplications,
  onDeleteApplication
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Application Form State
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: '',
    role: '',
    location: 'Remote',
    salary: '$160,000 - $180,000',
    status: 'applied',
    fitScore: 70,
    jobUrl: '',
    nextAction: '',
    followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    const updated = applications.map((app) =>
      app.id === appId ? { ...app, status: newStatus } : app
    );
    onUpdateApplications(updated);
  };

  const handleDelete = (appId: string) => {
    if (confirm('Delete this job application entry?')) {
      if (onDeleteApplication) {
        onDeleteApplication(appId);
      } else {
        const updated = applications.filter((app) => app.id !== appId);
        onUpdateApplications(updated);
      }
    }
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: formData.company || 'Company',
      role: formData.role || 'Senior Backend Engineer',
      location: formData.location || 'Remote',
      salary: formData.salary || '$150k - $170k',
      status: (formData.status as ApplicationStatus) || 'applied',
      fitScore: formData.fitScore || 70,
      jobUrl: formData.jobUrl || '#',
      nextAction: formData.nextAction || 'Follow up with recruiter',
      followUpDate: formData.followUpDate || '',
      notes: formData.notes || '',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    onUpdateApplications([newApp, ...applications]);
    setIsAddModalOpen(false);
    setFormData({
      company: '',
      role: '',
      location: 'Remote',
      salary: '$160,000 - $180,000',
      status: 'applied',
      fitScore: 70,
      jobUrl: '',
      nextAction: '',
      followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      notes: ''
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Pipeline KPI Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <span>Career Pivot Application Pipeline CRM</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track job applications, next follow-up dates, role fit alignment, and interview stages
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              title="Table List View"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Job Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target Job</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);

            return (
              <div key={col.id} className="flex flex-col space-y-3">
                {/* Column Header */}
                <div className={`p-3 rounded-2xl border ${col.bg} flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/80 text-white">
                    {colApps.length}
                  </span>
                </div>

                {/* Job Cards */}
                <div className="space-y-3 flex-1 min-h-[300px]">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                            {app.role}
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 shrink-0">
                          {app.fitScore}% Fit
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <DollarSign className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{app.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{app.location}</span>
                        </div>
                      </div>

                      {/* Next Action Box */}
                      {app.nextAction && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                            <span>Next Action:</span>
                            {app.followUpDate && (
                              <span className="text-amber-400 flex items-center space-x-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{app.followUpDate}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 leading-snug">{app.nextAction}</p>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                        <div className="flex items-center space-x-1">
                          {/* Move left */}
                          {col.id !== 'wishlist' && (
                            <button
                              onClick={() => {
                                const currentIndex = STATUS_COLUMNS.findIndex((c) => c.id === col.id);
                                if (currentIndex > 0) {
                                  handleStatusChange(app.id, STATUS_COLUMNS[currentIndex - 1].id);
                                }
                              }}
                              title="Move to previous stage"
                              className="p-1 rounded text-slate-500 hover:text-slate-200"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Move right */}
                          {col.id !== 'rejected' && (
                            <button
                              onClick={() => {
                                const currentIndex = STATUS_COLUMNS.findIndex((c) => c.id === col.id);
                                if (currentIndex < STATUS_COLUMNS.length - 1) {
                                  handleStatusChange(app.id, STATUS_COLUMNS[currentIndex + 1].id);
                                }
                              }}
                              title="Move to next stage"
                              className="p-1 rounded text-slate-500 hover:text-slate-200"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {app.jobUrl && app.jobUrl !== '#' && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-slate-500 hover:text-indigo-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1 rounded text-slate-600 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="h-32 rounded-2xl border border-dashed border-slate-800/80 flex items-center justify-center text-[11px] text-slate-600">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table List View */}
      {viewMode === 'table' && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Company & Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Salary</th>
                  <th className="p-4">Fit Score</th>
                  <th className="p-4">Next Action</th>
                  <th className="p-4">Follow-Up</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{app.company}</div>
                      <div className="text-slate-400 text-[11px]">{app.role} • {app.location}</div>
                    </td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none"
                      >
                        {STATUS_COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{app.salary}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                        {app.fitScore}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 max-w-xs">{app.nextAction}</td>
                    <td className="p-4 text-amber-400 font-mono text-[11px]">{app.followUpDate || '—'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Job Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Track Target Job Application</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coinbase"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Target Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Java Backend Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Location / Work Mode</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote (US)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Target Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $165,000 - $185,000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Status Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {STATUS_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Next Immediate Action</label>
                <input
                  type="text"
                  placeholder="e.g. Prepare system design portfolio on Kafka outbox pattern"
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Job Posting URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
