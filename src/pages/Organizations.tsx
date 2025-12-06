import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export default function Organizations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', slug: '', description: '' });

  const { data: organizationsResponse, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const result = await apiService.getOrganizations();
      return result;
    },
  });
  
  const organizations = organizationsResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: typeof newOrg) => apiService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowCreateModal(false);
      setNewOrg({ name: '', slug: '', description: '' });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrg.name || !newOrg.slug) return;
    
    // Generate slug from name if not provided
    const slug = newOrg.slug || newOrg.name.toLowerCase().replace(/\s+/g, '-');
    createMutation.mutate({ ...newOrg, slug });
  };

  if (isLoading) {
    return <div className="p-6">Loading organizations...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Organization
        </button>
      </div>

      {organizations && organizations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No organizations yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations?.map((org: any) => (
            <div
              key={org.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{org.name}</h3>
                  <p className="text-sm text-gray-500">@{org.slug}</p>
                </div>
                {org.logo_url && (
                  <img src={org.logo_url} alt={org.name} className="w-12 h-12 rounded" />
                )}
              </div>
              {org.description && (
                <p className="text-gray-600 mb-4">{org.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {org.plan}
                </span>
                <button
                  onClick={() => navigate(`/organizations/${org.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Organization</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="url-friendly-identifier"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and hyphens only</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
