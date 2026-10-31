import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  ListFilter,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../types';

interface ApplicationTrackerProps {
  applications: JobApplication[];
  onUpdateApplications: (updated: JobApplication[]) => void;
  onDeleteApplication?: (id: string) => void;
}

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
  { id: 'wishlist', label: 'Wishlist', color: 'border-[#D9CFB9] text-[#6B7169]' },
  { id: 'applied', label: 'Applied', color: 'border-[#D8B35F] text-[#7A5B1D]' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-[#C95F48] text-[#C95F48]' },
  { id: 'offer', label: 'Offer Received', color: 'border-[#466E67] text-[#38564F]' },
  { id: 'rejected', label: 'Archived', color: 'border-[#D9CFB9] text-[#6B7169]' }
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onUpdateApplications,
  onDeleteApplication
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: '',
    role: '',
    location: '',
    salary: '',
    status: 'applied',
    fitScore: 75,
    jobUrl: '',
    nextAction: '',
    followUpDate: '',
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
    if (!formData.company?.trim() || !formData.role?.trim()) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location?.trim() || 'Remote / Hybrid',
      salary: formData.salary?.trim() || 'Market Rate',
      status: (formData.status as ApplicationStatus) || 'applied',
      fitScore: formData.fitScore || 75,
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
      location: '',
      salary: '',
      status: 'applied',
      fitScore: 75,
      jobUrl: '',
      nextAction: '',
      followUpDate: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#D9CFB9]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#293C3A] flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-[#466E67]" />
            <span>Job Tracker</span>
          </h1>
          <p className="text-xs text-[#6B7169] mt-0.5">
            Track your job applications, interviews, and next steps.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#FFF7E8] border border-[#D9CFB9] text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#C95F48] text-white' : 'text-[#6B7169] hover:text-[#293C3A]'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#C95F48] text-white' : 'text-[#6B7169] hover:text-[#293C3A]'
              }`}
              title="Table List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          {/* Add Job Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="art-btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Target Job</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex space-x-4 overflow-x-auto pb-6 snap-x">
          {STATUS_COLUMNS.map((col, colIdx) => {
            const colApps = applications.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="w-72 shrink-0 flex flex-col space-y-3 snap-start"
              >
                {/* Column Header */}
                <div className={`p-3 rounded-xl bg-[#FFF7E8] border ${col.color} flex items-center justify-between`}>
                  <span className="text-xs font-bold">{col.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E8EBDD] text-[#293C3A]">
                    {colApps.length}
                  </span>
                </div>

                {/* Job Cards */}
                <div className="space-y-3 min-h-[350px]">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="art-card p-4 space-y-3 hover:border-[#C95F48] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-editorial text-sm font-bold text-[#293C3A]">
                            {app.company}
                          </h4>
                          <p className="text-xs text-[#6B7169] line-clamp-1">{app.role}</p>
                        </div>
                        {app.fitScore && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8EBDD] text-[#38564F] shrink-0">
                            {app.fitScore}% Fit
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-[#6B7169]">
                        {app.salary && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-[#C95F48]" />
                            <span>{app.salary}</span>
                          </div>
                        )}
                        {app.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-[#466E67]" />
                            <span>{app.location}</span>
                          </div>
                        )}
                      </div>

                      {app.nextAction && (
                        <div className="p-2.5 rounded-lg bg-[#F5EBD6] text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B7169]">
                            <span>NEXT ACTION:</span>
                            {app.followUpDate && (
                              <span className="flex items-center space-x-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{app.followUpDate}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#293C3A]">{app.nextAction}</p>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#D9CFB9] text-xs">
                        <div className="flex items-center space-x-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() => handleStatusChange(app.id, STATUS_COLUMNS[colIdx - 1].id)}
                              className="p-1 rounded text-[#6B7169] hover:text-[#293C3A] hover:bg-[#E8EBDD] cursor-pointer"
                              title={`Move back to ${STATUS_COLUMNS[colIdx - 1].label}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {colIdx < STATUS_COLUMNS.length - 1 && (
                            <button
                              onClick={() => handleStatusChange(app.id, STATUS_COLUMNS[colIdx + 1].id)}
                              className="p-1 rounded text-[#6B7169] hover:text-[#293C3A] hover:bg-[#E8EBDD] cursor-pointer"
                              title={`Advance to ${STATUS_COLUMNS[colIdx + 1].label}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 text-[#6B7169]">
                          {app.jobUrl && app.jobUrl !== '#' && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded hover:text-[#293C3A] hover:bg-[#E8EBDD]"
                              title="Open Job Posting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1 rounded hover:text-[#C95F48] hover:bg-[#FAECE8] cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="h-32 rounded-xl border border-dashed border-[#D9CFB9] flex items-center justify-center text-xs text-[#6B7169]">
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
        <div className="art-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8EBDD] text-[#293C3A] border-b border-[#D9CFB9]">
                <tr>
                  <th className="p-3.5 font-bold">Company</th>
                  <th className="p-3.5 font-bold">Role</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Match</th>
                  <th className="p-3.5 font-bold">Location</th>
                  <th className="p-3.5 font-bold">Next Action</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9CFB9]">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#E8EBDD]/40 transition-colors">
                    <td className="p-3.5 font-bold text-[#293C3A]">{app.company}</td>
                    <td className="p-3.5 text-[#6B7169]">{app.role}</td>
                    <td className="p-3.5">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="art-input text-xs py-1 px-2 cursor-pointer"
                      >
                        {STATUS_COLUMNS.map((col) => (
                          <option key={col.id} value={col.id}>{col.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 font-semibold text-[#38564F]">
                      {app.fitScore ? `${app.fitScore}%` : '-'}
                    </td>
                    <td className="p-3.5 text-[#6B7169]">{app.location || '-'}</td>
                    <td className="p-3.5 text-[#6B7169]">
                      {app.nextAction ? `${app.nextAction} (${app.followUpDate || 'No date'})` : '-'}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1 rounded text-[#6B7169] hover:text-[#C95F48] hover:bg-[#FAECE8] cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Target Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#293C3A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="art-card p-6 sm:p-8 max-w-lg w-full space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9CFB9]">
              <h3 className="font-editorial text-lg font-bold text-[#293C3A]">
                Add Target Job
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6B7169] hover:text-[#293C3A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#293C3A] mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Stripe, Acme Corp"
                    className="art-input w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#293C3A] mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className="art-input w-full p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#293C3A] mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Remote"
                    className="art-input w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#293C3A] mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. $160k - $190k"
                    className="art-input w-full p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#293C3A] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="art-input w-full p-2.5 cursor-pointer"
                  >
                    {STATUS_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#293C3A] mb-1">Next Action</label>
                <input
                  type="text"
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  placeholder="e.g. Follow up on application, review system design notes"
                  className="art-input w-full p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#D9CFB9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="art-btn-secondary px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="art-btn-primary px-5 py-2 cursor-pointer"
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
