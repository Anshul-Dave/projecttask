"use client";

import { useState } from 'react';
import { useApp } from '@/src/contexts/appcontext';
import { useAuth } from '@/src/contexts/authcontext';
import { Button } from '@/src/components/common/button';
import ConfirmationModal from '@/src/components/modal/confirmationmodal';
import { Users, Mail, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MembersPage() {
  const { activeProject, addMemberToProject, removeMemberFromProject } = useApp();
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const isOwner = activeProject?.userEmail === user?.email;

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Users className="w-16 h-16 text-neutral-300 mb-4" />
        <h2 className="text-xl font-bold text-neutral-700">No Project Selected</h2>
        <p className="text-neutral-500 mt-2 max-w-md">Please select a project from the sidebar to manage its team members.</p>
        <Button className="mt-6" onClick={() => router.push('/')}>Go to Dashboard</Button>
      </div>
    );
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSuccessMsg('');
    setErrorMsg('');
    setIsLoading(true);

    const res = await addMemberToProject(activeProject.id.toString(), email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || `User ${email} added successfully!`);
      setEmail('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message || 'Failed to add member.');
    }
  };

  const handleRemoveMemberClick = (targetEmail: string) => {
    setMemberToDelete(targetEmail);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete) return;
    const targetEmail = memberToDelete;

    setSuccessMsg('');
    setErrorMsg('');
    setRemovingEmail(targetEmail);
    setIsDeleteModalOpen(false);

    const res = await removeMemberFromProject(activeProject.id.toString(), targetEmail);
    setRemovingEmail(null);
    setMemberToDelete(null);

    if (res.success) {
      setSuccessMsg(res.message || `User ${targetEmail} removed successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message || 'Failed to remove member.');
    }
  };

  const membersList = [
    { email: activeProject.userEmail, role: 'Owner' },
    ...(activeProject.members || []).map(m => ({ email: m, role: 'Member' }))
  ];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col py-6 px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Team Members</h1>
        <p className="text-neutral-500 mt-1.5 text-[15px]">Manage collaborators for <strong>{activeProject.name}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Member Form */}
        <div className="md:col-span-1">
          <div className="bg-card-bg border border-neutral-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-600" />
              Add New Member
            </h3>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-background"
                    placeholder="user@example.com"
                  />
                </div>
              </div>
              
              <Button type="submit" variant="primary" disabled={isLoading} className="w-full justify-center">
                {isLoading ? 'Adding...' : 'Invite Member'}
              </Button>

              {errorMsg && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 text-[13px] font-medium rounded-lg border border-red-100 text-center">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mt-3 p-3 bg-green-50 text-green-700 text-[13px] font-medium rounded-lg border border-green-100 text-center">
                  {successMsg}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Current Members List */}
        <div className="md:col-span-2">
          <div className="bg-card-bg border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Current Collaborators ({membersList.length})
              </h3>
            </div>
            
            <div className="divide-y divide-neutral-100">
              {membersList.map((member, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0 border border-primary-200">
                      {member.email?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{member.email}</p>
                      <p className="text-[11px] font-semibold text-neutral-500 mt-0.5 uppercase tracking-wider">{member.role === 'Owner' ? 'Project Creator' : 'Invited Member'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      member.role === 'Owner' ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}>
                      {member.role}
                    </span>
                    {isOwner && member.role !== 'Owner' && (
                      <button
                        onClick={() => handleRemoveMemberClick(member.email)}
                        disabled={removingEmail === member.email}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        description={`Are you sure you want to remove ${memberToDelete} from the project? They will lose access to all tasks and boards.`}
        confirmText="Remove"
        type="delete"
      />
    </div>
  );
}
