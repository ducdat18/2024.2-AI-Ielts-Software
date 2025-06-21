import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { gsap } from 'gsap';
import { useAuth } from '@/hooks/useAuthApi';
import { useAPI, useSubmit } from '@/hooks/useApi';
import api from '@/api/indexApi';
import type {
  UserUpdateDto,
  PasswordUpdateDto,
  ProfileImageUpdateDto,
} from '@/types';
import { LoadingSpinner } from '@/components/auth';

interface ProfileForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  email: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // API calls
  const {
    data: userData,
    isLoading: userLoading,
    execute: fetchUser,
  } = useAPI(api.user.getUserById.bind(api.user));

  const updateProfile = useSubmit(
    (data: UserUpdateDto) => api.user.updateUser(user?.userId || '', data),
    {
      onSuccess: () => {
        setIsEditingProfile(false);
        if (user?.userId) {
          fetchUser(user.userId);
        }
      },
    }
  );

  const updatePassword = useSubmit(
    (data: PasswordUpdateDto) =>
      api.user.updatePassword(user?.userId || '', data),
    {
      onSuccess: () => {
        setShowPasswordModal(false);
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
    }
  );

  const updateProfileImage = useSubmit(
    (data: ProfileImageUpdateDto) =>
      api.user.updateProfileImage(user?.userId || '', data),
    {
      onSuccess: () => {
        if (user?.userId) {
          fetchUser(user.userId);
        }
      },
    }
  );

  const deleteUser = useSubmit(() => api.user.deleteUser(user?.userId || ''), {
    onSuccess: () => {
      // Navigate to login after account deletion
      window.location.href = '/auth/login';
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setProfileForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        dateOfBirth: userData.dateOfBirth || '',
        country: userData.country || '',
        email: userData.email || '',
      });
    } else if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        country: user.country || '',
        email: user.email || '',
      });
    }
  }, [userData, user]);

  // Fetch user data
  useEffect(() => {
    if (user?.userId && isAuthenticated) {
      fetchUser(user.userId).catch((error) =>
        console.error('Failed to fetch user data:', error)
      );
    }
  }, [user?.userId, isAuthenticated]);

  // GSAP animations
  useEffect(() => {
    if (containerRef.current && !authLoading && !userLoading) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.dashboard-card'),
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
  }, [authLoading, userLoading]);

  // Navigation function
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Form handlers
  const handleProfileSubmit = () => {
    const updateData: UserUpdateDto = {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      dateOfBirth: profileForm.dateOfBirth,
      country: profileForm.country || undefined,
    };
    updateProfile.submit(updateData);
  };

  const handlePasswordSubmit = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    updatePassword.submit(passwordForm);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imagePath = `/uploads/profile/${user?.userId}_${Date.now()}.jpg`;
      updateProfileImage.submit({ imagePath });
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      deleteUser.submit({});
    }
    setShowDeleteModal(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please log in to view your profile
          </h1>
          <Button
            onClick={() => navigateTo('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = userData || user;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-gray-200 pt-20"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="dashboard-card mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-100">
            Your <span className="text-blue-400">Profile</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Manage your account settings and personal information
          </p>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Basic Info */}
          <Card className="dashboard-card bg-gray-900/80 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">
                Profile Picture
              </CardTitle>
              <CardDescription className="text-gray-500">
                Your profile image and basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4">
                  {currentUser.firstName?.charAt(0)}
                  {currentUser.lastName?.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-gray-200 mb-2">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <p className="text-gray-400">{currentUser.email}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Member since {formatDate(currentUser.registrationDate)}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById('profile-image-upload')?.click()
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={updateProfileImage.isSubmitting}
                  >
                    {updateProfileImage.isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Uploading...</span>
                      </>
                    ) : (
                      'Change Picture'
                    )}
                  </Button>
                </div>

                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
                >
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card className="dashboard-card bg-gray-900/80 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-200">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Update your personal details and preferences
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      if (isEditingProfile) {
                        setIsEditingProfile(false);
                        // Reset form to original values
                        setProfileForm({
                          firstName: currentUser.firstName || '',
                          lastName: currentUser.lastName || '',
                          dateOfBirth: currentUser.dateOfBirth || '',
                          country: currentUser.country || '',
                          email: currentUser.email || '',
                        });
                      } else {
                        setIsEditingProfile(true);
                      }
                    }}
                    variant={isEditingProfile ? 'outline' : 'default'}
                    className={
                      isEditingProfile
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="block text-sm font-medium text-gray-400 mb-2">
                          First Name *
                        </div>
                        <input
                          type="text"
                          required
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <div className="block text-sm font-medium text-gray-400 mb-2">
                          Last Name *
                        </div>
                        <input
                          type="text"
                          required
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <div className="block text-sm font-medium text-gray-400 mb-2">
                          Email (Read Only)
                        </div>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <div className="block text-sm font-medium text-gray-400 mb-2">
                          Date of Birth
                        </div>
                        <input
                          type="date"
                          value={profileForm.dateOfBirth}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="block text-sm font-medium text-gray-400 mb-2">
                          Country
                        </div>
                        <input
                          type="text"
                          value={profileForm.country}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              country: e.target.value,
                            })
                          }
                          placeholder="Enter your country"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {updateProfile.submitError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {updateProfile.submitError}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={handleProfileSubmit}
                        disabled={updateProfile.isSubmitting}
                        className="bg-green-600 hover:bg-green-700 px-8"
                      >
                        {updateProfile.isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Saving...</span>
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          First Name
                        </div>
                        <div className="text-lg text-gray-200">
                          {currentUser.firstName}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          Last Name
                        </div>
                        <div className="text-lg text-gray-200">
                          {currentUser.lastName}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">Email</div>
                        <div className="text-lg text-gray-200">
                          {currentUser.email}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          Date of Birth
                        </div>
                        <div className="text-lg text-gray-200">
                          {currentUser.dateOfBirth
                            ? formatDate(currentUser.dateOfBirth)
                            : 'Not set'}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">
                          Country
                        </div>
                        <div className="text-lg text-gray-200">
                          {currentUser.country || 'Not specified'}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">Role</div>
                        <div className="text-lg text-gray-200 capitalize">
                          {currentUser.userRole}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Settings */}
        <Card className="dashboard-card bg-gray-900/80 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">
              Account Settings
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage your account security and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-200">
                    Last Login
                  </h3>
                  <p className="text-gray-400">
                    {currentUser.lastLogin
                      ? formatDate(currentUser.lastLogin)
                      : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-200">
                    Account Security
                  </h3>
                  <p className="text-gray-400">
                    Keep your account secure with a strong password
                  </p>
                </div>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-red-400">
                    Danger Zone
                  </h3>
                  <p className="text-gray-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500/20"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-700 max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-xl text-gray-200">
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Enter your current password and choose a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="block text-sm font-medium text-gray-400 mb-2">
                      Current Password *
                    </div>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          oldPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="block text-sm font-medium text-gray-400 mb-2">
                      New Password *
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm New Password *
                    </div>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {updatePassword.submitError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {updatePassword.submitError}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordForm({
                          oldPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordSubmit}
                      disabled={updatePassword.isSubmitting}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                    >
                      {updatePassword.isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Updating...</span>
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-700 max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-xl text-red-400">
                  Delete Account
                </CardTitle>
                <CardDescription className="text-gray-500">
                  This action cannot be undone. All your data will be
                  permanently deleted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h3 className="text-lg font-medium text-red-400 mb-2">
                      ⚠️ Warning
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Deleting your account will permanently remove:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                      <li>All your test results and progress</li>
                      <li>Personal information and preferences</li>
                      <li>Account access and login credentials</li>
                    </ul>
                  </div>

                  {deleteUser.submitError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {deleteUser.submitError}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowDeleteModal(false)}
                      variant="outline"
                      className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteUser.isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {deleteUser.isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Deleting...</span>
                        </>
                      ) : (
                        'Delete Account'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="dashboard-card mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigateTo('/learner/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigateTo('/learner/progress')}
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/20 px-8 py-6 text-lg"
            >
              View Progress
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
