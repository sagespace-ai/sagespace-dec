import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'moderation'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, page],
    queryFn: async () => {
      const result = await apiService.getAdminUsers(undefined, searchTerm, page, 50);
      return result.data || { users: [] };
    },
    enabled: activeTab === 'users',
  });

  const { data: moderationData, isLoading: moderationLoading } = useQuery({
    queryKey: ['moderation', page],
    queryFn: async () => {
      const result = await apiService.getModerationRecords('pending', undefined, page, 50);
      return result.data || { records: [] };
    },
    enabled: activeTab === 'moderation',
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const moderateMutation = useMutation({
    mutationFn: (data: { resource_type: string; resource_id: string; status: string; reason?: string }) =>
      apiService.moderateContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation'] });
    },
  });

  const handleModerate = (resourceType: string, resourceId: string, status: string) => {
    moderateMutation.mutate({
      resource_type: resourceType,
      resource_id: resourceId,
      status,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="border-b mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'moderation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Content Moderation
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full max-w-md px-4 py-2 border rounded-lg"
            />
          </div>

          {usersLoading ? (
            <div>Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Posts</th>
                    <th className="text-left p-4">Followers</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.users?.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {user.avatar && (
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                          )}
                          {user.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.stats?.posts || 0}</td>
                      <td className="p-4">{user.stats?.followers || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'moderation' && (
        <div>
          {moderationLoading ? (
            <div>Loading moderation queue...</div>
          ) : (
            <div className="space-y-4">
              {moderationData?.records?.map((record: any) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm text-gray-500">{record.resource_type}</span>
                      <h3 className="font-semibold">
                        {record.resource?.title || record.resource?.content?.substring(0, 50)}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  {record.resource && (
                    <p className="text-gray-600 mb-4">
                      {record.resource.description || record.resource.content}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerate(record.resource_type, record.resource_id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(record.resource_type, record.resource_id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
