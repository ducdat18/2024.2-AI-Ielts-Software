import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { gsap } from 'gsap';
import api from '@/api/indexApi';
import type { User, UserRole, UserUpdateDto, PasswordUpdateDto } from '@/types';

interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
}

// Main User Management Page
const UserManagementPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<'list' | 'details'>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination
  const [filters, setFilters] = useState<UserFilters>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.management-card'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        }
      );
    }
  }, [loading, currentView]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.user.getUsers({
        page: 1,
        limit: 100,
      });

      setUsers(
        response.map((user) => ({
          ...user,
          dateOfBirth: user.dateOfBirth || '',
        }))
      );

      // Calculate basic stats
      const totalUsers = response.length;
      const adminUsers = response.filter((u) => u.userRole === 'admin').length;
      const regularUsers = response.filter((u) => u.userRole === 'user').length;

      setStats({
        totalUsers,
        adminUsers,
        regularUsers,
      });
    } catch (err) {
      setError('Error loading users');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId: string) => {
    try {
      setLoading(true);
      const response = await api.user.getUserById(userId);
      setSelectedUser(response);
      setCurrentView('details');
    } catch (err) {
      setError('Error loading user details');
      console.error('User details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.user.deleteUser(userToDelete);
      setUsers((prev) => prev.filter((u) => u.userId !== userToDelete));
      if (selectedUser && selectedUser.userId === userToDelete) {
        setCurrentView('list');
        setSelectedUser(null);
      }
    } catch (err) {
      setError('Error deleting user');
      console.error('Delete user error:', err);
    } finally {
      setUserToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const updateData: UserUpdateDto = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        dateOfBirth: updatedUser.dateOfBirth,
        country: updatedUser.country,
      };

      const response = await api.user.updateUser(
        updatedUser.userId,
        updateData
      );
      setSelectedUser(response);

      // Update in the list
      setUsers((prev) =>
        prev.map((u) => (u.userId === updatedUser.userId ? response : u))
      );
    } catch (err) {
      setError('Error updating user');
      console.error('Update user error:', err);
    }
  };

  const handlePasswordUpdate = async (
    userId: string,
    passwordData: PasswordUpdateDto
  ) => {
    try {
      await api.user.updatePassword(userId, passwordData);
      // Show success message or update UI as needed
    } catch (err) {
      setError('Error updating password');
      console.error('Update password error:', err);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesRole = !filters.role || user.userRole === filters.role;
    const matchesSearch =
      !filters.search ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());

    return matchesRole && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: UserRole) => {
    return role === 'admin'
      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-black text-gray-200 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-gray-200 pt-20"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              User Management
            </h1>
            <div className="flex items-center text-gray-500 text-sm">
              <span
                className={`cursor-pointer hover:text-blue-400 ${
                  currentView === 'list' ? 'text-blue-400' : ''
                }`}
                onClick={handleBackToList}
              >
                All Users
              </span>
              {selectedUser && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-400">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
            <Button
              onClick={() => setError(null)}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Content Views */}
        {currentView === 'list' && (
          <UserListView
            users={filteredUsers}
            allUsers={users}
            stats={stats}
            filters={filters}
            setFilters={setFilters}
            onUserSelect={handleUserSelect}
            onDeleteUser={handleDeleteUser}
            formatDate={formatDate}
            getRoleColor={getRoleColor}
            loading={loading}
          />
        )}

        {currentView === 'details' && selectedUser && (
          <UserDetailsView
            user={selectedUser}
            onUserUpdate={handleUserUpdate}
            onPasswordUpdate={handlePasswordUpdate}
            formatDate={formatDate}
            getRoleColor={getRoleColor}
            loading={loading}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteUser}
          />
        )}
      </div>
    </div>
  );
};

// User List View Component
const UserListView: React.FC<{
  users: User[];
  allUsers: User[];
  stats: UserStats | null;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  onUserSelect: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  formatDate: (dateString: string) => string;
  getRoleColor: (role: UserRole) => string;
  loading: boolean;
}> = ({
  users,
  allUsers,
  stats,
  filters,
  setFilters,
  onUserSelect,
  onDeleteUser,
  formatDate,
  getRoleColor,
  loading,
}) => {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="management-card bg-gray-900/80 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-500">Total Users</div>
            </CardContent>
          </Card>
          <Card className="management-card bg-gray-900/80 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">
                {stats.adminUsers}
              </div>
              <div className="text-sm text-gray-500">Admins</div>
            </CardContent>
          </Card>
          <Card className="management-card bg-gray-900/80 border-gray-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {stats.regularUsers}
              </div>
              <div className="text-sm text-gray-500">Regular Users</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="management-card bg-gray-900/80 border-gray-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search || ''}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Role
              </label>
              <select
                value={filters.role || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    role: (e.target.value as UserRole) || undefined,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({})}
                variant="outline"
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="management-card bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-200">
              Users ({allUsers.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Country
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Registered
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Last Login
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.userId}
                        className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div
                                className="text-gray-200 font-medium cursor-pointer hover:text-blue-400"
                                onClick={() => onUserSelect(user.userId)}
                              >
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                              user.userRole
                            )}`}
                          >
                            {user.userRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {user.country || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {formatDate(user.registrationDate)}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {user.lastLogin
                            ? formatDate(user.lastLogin)
                            : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => onUserSelect(user.userId)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View
                            </Button>
                            <Button
                              onClick={() => onDeleteUser(user.userId)}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// User Details View Component
const UserDetailsView: React.FC<{
  user: User;
  onUserUpdate: (user: User) => void;
  onPasswordUpdate: (userId: string, passwordData: PasswordUpdateDto) => void;
  formatDate: (dateString: string) => string;
  getRoleColor: (role: UserRole) => string;
  loading: boolean;
}> = ({
  user,
  onUserUpdate,
  onPasswordUpdate,
  formatDate,
  getRoleColor,
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    country: user.country || '',
  });

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      dateOfBirth: editForm.dateOfBirth,
      country: editForm.country,
    };
    onUserUpdate(updatedUser);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card className="management-card bg-gray-900/80 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-200">
              User Information
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
              >
                Change Password
              </Button>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={loading}
                className={
                  isEditing
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              >
                {loading
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Edit User'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm({ ...editForm, country: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Full Name</div>
                <div className="text-lg font-semibold text-gray-200">
                  {user.firstName} {user.lastName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Email</div>
                <div className="text-lg font-semibold text-gray-200">
                  {user.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Role</div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                    user.userRole
                  )}`}
                >
                  {user.userRole}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Date of Birth</div>
                <div className="text-lg font-semibold text-gray-200">
                  {formatDate(user.dateOfBirth)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Country</div>
                <div className="text-lg font-semibold text-gray-200">
                  {user.country || 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">
                  Registration Date
                </div>
                <div className="text-lg font-semibold text-gray-200">
                  {formatDate(user.registrationDate)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic User Info */}
      <Card className="management-card bg-gray-900/80 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">User ID</div>
              <div className="text-lg font-semibold text-gray-200 font-mono">
                {user.userId}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Last Login</div>
              <div className="text-lg font-semibold text-gray-200">
                {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordChangeModal
          userId={user.userId}
          onClose={() => setShowPasswordModal(false)}
          onPasswordUpdate={onPasswordUpdate}
        />
      )}
    </div>
  );
};

// Password Change Modal
const PasswordChangeModal: React.FC<{
  userId: string;
  onClose: () => void;
  onPasswordUpdate: (userId: string, passwordData: PasswordUpdateDto) => void;
}> = ({ userId, onClose, onPasswordUpdate }) => {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    onPasswordUpdate(userId, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={form.oldPassword}
                onChange={(e) =>
                  setForm({ ...form, oldPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                New Password *
              </label>
              <input
                type="password"
                required
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Delete Confirm Modal
const DeleteConfirmModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
}> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-xl text-gray-200">
            Confirm Delete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
