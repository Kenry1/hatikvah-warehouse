import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { auth as firebaseAuth, db, storage } from '@/lib/firebase';
import { 
  sendPasswordResetEmail,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Moon, Sun, Key, Trash2, Loader2, Mail, User, Upload, Shield, Smartphone } from 'lucide-react';

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, auth } = useAuth();
  
  // Loading states
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Form states
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailConfirmation, setEmailConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load full profile from Firestore when modal opens
  useEffect(() => {
    const loadProfile = async () => {
      if (!open || !user?.id) return;
      try {
        const userRef = doc(db, 'users', user.id);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as any;
          setUsername(data.username || user.username || '');
          setNewEmail(data.email || user.email || '');
          setPhoneNumber(data.phoneNumber || '');
          setBio(data.bio || '');
          setDateOfBirth(data.dateOfBirth || '');
          setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isDarkMode = theme === 'dark';

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast({
      title: 'Theme Updated',
      description: `Switched to ${checked ? 'dark' : 'light'} mode`,
    });
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    try {
      if (!user?.email) throw new Error('No email on profile');
      await sendPasswordResetEmail(auth || firebaseAuth, user.email);
      {
        toast({
          title: 'Password Reset Sent',
          description: 'Check your email for password reset instructions',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (newEmail !== emailConfirmation) {
      toast({
        title: 'Error',
        description: 'Email addresses do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const cu = (auth || firebaseAuth).currentUser;
      if (!cu) throw new Error('Not authenticated');
      await fbUpdateEmail(cu, newEmail);
      if (user?.id) {
        await updateDoc(doc(db, 'users', user.id), { email: newEmail });
      }
      {
        toast({
          title: 'Email Updated',
          description: 'Your email address has been updated successfully',
        });
        setEmailConfirmation('');
      }
    } catch (error) {
      if (error?.code === 'auth/requires-recent-login') {
        toast({ title: 'Re-authentication required', description: 'Please log out and back in, then try again.', variant: 'destructive' });
      } else {
      toast({
        title: 'Error',
        description: 'Failed to update email. Please try again.',
        variant: 'destructive',
      });
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const cu = (auth || firebaseAuth).currentUser;
      if (!cu || !cu.email) throw new Error('Not authenticated');
      const cred = EmailAuthProvider.credential(cu.email, currentPassword);
      await reauthenticateWithCredential(cu, cred);
      await fbUpdatePassword(cu, newPassword);
      {
        toast({
          title: 'Password Updated',
          description: 'Your password has been changed successfully',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      if (!user?.id) throw new Error('Not authenticated');
      await updateDoc(doc(db, 'users', user.id), {
        username,
        bio,
        dateOfBirth,
        phoneNumber,
      });
      // Update local cache for immediate feedback
      const current = localStorage.getItem('currentUser');
      if (current) {
        const cu = JSON.parse(current);
        localStorage.setItem('currentUser', JSON.stringify({ ...cu, username, phoneNumber }));
      }
      {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      if (!user?.id) throw new Error('Not authenticated');
      const avatarRef = ref(storage, `avatars/${user.id}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);
      await updateDoc(doc(db, 'users', user.id), { photoURL: url });
      {
        toast({
          title: 'Avatar Updated',
          description: 'Your profile picture has been updated successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      if (!user?.id) throw new Error('Not authenticated');
      await updateDoc(doc(db, 'users', user.id), { twoFactorEnabled: enabled });
      setTwoFactorEnabled(enabled);
      toast({
        title: '2FA Updated',
        description: `Two-factor authentication has been ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update 2FA settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const cu = (auth || firebaseAuth).currentUser;
      if (!cu) throw new Error('Not authenticated');
      if (user?.id) {
        // Optionally mark user as deleted in Firestore; actual delete may require admin privileges
        await updateDoc(doc(db, 'users', user.id), { status: 'deleted' });
      }
      await deleteUser(cu);
      {
        toast({
          title: 'Account Deleted',
          description: 'Your account has been successfully deleted',
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your account preferences and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Account & Security</TabsTrigger>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Theme Toggle */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Appearance</h3>
                <p className="text-xs text-muted-foreground">
                  Customize how the app looks and feels
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="theme-toggle" className="text-sm font-normal">
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Quick Actions</h3>
                <p className="text-xs text-muted-foreground">
                  Common account actions
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleResetPassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                Reset Password
              </Button>
            </div>
          </TabsContent>

          {/* Account & Security Tab */}
          <TabsContent value="security" className="space-y-6 mt-6">
            {/* Change Email */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Change Email Address
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update your email address with confirmation
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-email">Confirm New Email</Label>
                  <Input
                    id="confirm-email"
                    type="email"
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    placeholder="Confirm new email address"
                  />
                </div>
                <Button
                  onClick={handleUpdateEmail}
                  disabled={isUpdatingEmail || !newEmail || !emailConfirmation}
                  className="w-full"
                >
                  {isUpdatingEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Update Email
                </Button>
              </div>
            </div>

            <Separator />

            {/* Change Password */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Enter current password and set a new one
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {isUpdatingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Change Password
                </Button>
              </div>
            </div>

            <Separator />

            {/* Two-Factor Authentication */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="2fa-toggle" className="text-sm font-normal">
                    Enable 2FA (SMS/Authenticator)
                  </Label>
                </div>
                <Switch
                  id="2fa-toggle"
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>
            </div>

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                <p className="text-xs text-muted-foreground">
                  Irreversible and destructive actions
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all of your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6 mt-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Profile Picture
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload or change your avatar
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload" asChild>
                    <Button variant="outline" disabled={isUploadingAvatar}>
                      {isUploadingAvatar ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Photo
                    </Button>
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  Update your personal information
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="username">Username / Display Name</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <Label htmlFor="date-of-birth">Date of Birth</Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="w-full"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Update Profile
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}