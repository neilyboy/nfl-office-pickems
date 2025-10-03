'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  UserPlus, 
  Edit, 
  Trash2, 
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarType: string;
  avatarValue: string | null;
  avatarColor: string;
  mustChangePassword: boolean;
  passwordResetRequested: boolean;
  createdAt: string;
}

export function UserManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: 'nflofficepickems',
    firstName: '',
    lastName: '',
    avatarType: 'initials' as 'initials' | 'emoji' | 'mdi',
    avatarValue: '',
    avatarColor: '#3b82f6',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add user');
      }

      toast({
        title: 'Success! 🎉',
        description: `User ${formData.username} created successfully`,
      });

      setShowAddDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      toast({
        title: 'Success! ✅',
        description: 'User updated successfully',
      });

      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast({
        title: 'User Deleted',
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been removed`,
      });

      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast({
        title: 'Password Reset 🔑',
        description: `Password reset to default for ${user.firstName}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      avatarType: user.avatarType as any,
      avatarValue: user.avatarValue || '',
      avatarColor: user.avatarColor,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: 'nflofficepickems',
      firstName: '',
      lastName: '',
      avatarType: 'initials',
      avatarValue: '',
      avatarColor: '#3b82f6',
    });
  };

  const renderAvatar = (user: User) => {
    if (user.avatarType === 'emoji' && user.avatarValue) {
      return <span className="text-2xl">{user.avatarValue}</span>;
    }
    
    if (user.avatarType === 'mdi' && user.avatarValue) {
      return <span className="text-sm">{user.avatarValue}</span>;
    }
    
    return getInitials(user.firstName, user.lastName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-sm text-muted-foreground">Add, edit, and manage users</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              Manage all users in your office pickems
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && users.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No users yet</p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add First User
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12" style={{ backgroundColor: user.avatarColor }}>
                        <AvatarFallback style={{ backgroundColor: user.avatarColor, color: 'white' }}>
                          {renderAvatar(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.firstName} {user.lastName}</p>
                          {user.passwordResetRequested && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Reset Requested
                            </Badge>
                          )}
                          {user.mustChangePassword && (
                            <Badge variant="secondary" className="text-xs">
                              Must Change Password
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user)}
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for office pickems
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="john.doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Default: nflofficepickems"
              />
              <p className="text-xs text-muted-foreground mt-1">
                User must change on first login
              </p>
            </div>
            <div>
              <Label htmlFor="avatarColor">Avatar Color</Label>
              <Input
                id="avatarColor"
                type="color"
                value={formData.avatarColor}
                onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-avatarColor">Avatar Color</Label>
              <Input
                id="edit-avatarColor"
                type="color"
                value={formData.avatarColor}
                onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
