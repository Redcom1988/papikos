import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Head } from '@inertiajs/react';
import { Users, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Edit, Trash2, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import SearchBar from "@/components/ui/search-bar";

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    email_verified: boolean;
    created_at: string;
}

interface UserAllPageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

export default function UserAllPage({ users }: UserAllPageProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'renter',
    });

    const { data: addData, setData: setAddData, post, processing: addProcessing, errors: addErrors, reset: resetAdd } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'renter',
        password: '',
        password_confirmation: '',
    });

    const { delete: destroy } = useForm();

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        
        setDeletingId(userToDelete.id);
        destroy(`/dashboard/users/${userToDelete.id}`, {
            onFinish: () => {
                setDeletingId(null);
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            }
        });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
        });
        setEditDialogOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        
        put(`/dashboard/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditDialogOpen(false);
                resetEdit();
                setEditingUser(null);
            }
        });
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/users', {
            onSuccess: () => {
                setAddDialogOpen(false);
                resetAdd();
            }
        });
    };

    const   getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (role.toLowerCase()) {
            case 'admin':
                return "default";
            case 'owner':
                return "secondary";
            case 'renter':
                return "outline";
            default:
                return "outline";
        }
    };

    const getRoleDisplay = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const filteredUsers = users.data.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/dashboard/users' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Users" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">
                            View and manage all registered users
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm font-medium">{users.total} Total Users</span>
                        </div>
                        
                        {/* Add User Dialog */}
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="add-name">Name *</Label>
                                        <Input
                                            id="add-name"
                                            value={addData.name}
                                            onChange={e => setAddData('name', e.target.value)}
                                            className={addErrors.name ? 'border-red-500' : ''}
                                        />
                                        {addErrors.name && <p className="text-sm text-red-500 mt-1">{addErrors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="add-email">Email *</Label>
                                        <Input
                                            id="add-email"
                                            type="email"
                                            value={addData.email}
                                            onChange={e => setAddData('email', e.target.value)}
                                            className={addErrors.email ? 'border-red-500' : ''}
                                        />
                                        {addErrors.email && <p className="text-sm text-red-500 mt-1">{addErrors.email}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="add-phone">Phone</Label>
                                        <Input
                                            id="add-phone"
                                            value={addData.phone}
                                            onChange={e => setAddData('phone', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="add-role">Role *</Label>
                                        <Select value={addData.role} onValueChange={(value) => setAddData('role', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="owner">Owner</SelectItem>
                                                <SelectItem value="renter">Renter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="add-password">Password *</Label>
                                        <Input
                                            id="add-password"
                                            type="password"
                                            value={addData.password}
                                            onChange={e => setAddData('password', e.target.value)}
                                            className={addErrors.password ? 'border-red-500' : ''}
                                        />
                                        {addErrors.password && <p className="text-sm text-red-500 mt-1">{addErrors.password}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="add-password-confirmation">Confirm Password *</Label>
                                        <Input
                                            id="add-password-confirmation"
                                            type="password"
                                            value={addData.password_confirmation}
                                            onChange={e => setAddData('password_confirmation', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={addProcessing} className="flex-1">
                                            <Save className="w-4 h-4 mr-2" />
                                            {addProcessing ? 'Creating...' : 'Create User'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Users</CardTitle>
                            <div className="w-96">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search users, emails, or roles..."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Verified</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.phone ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    {user.phone}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                                {getRoleDisplay(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {user.email_verified ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm text-green-600">Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                        <span className="text-sm text-red-600">Unverified</span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.created_at}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={deletingId === user.id}
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((users.current_page - 1) * users.per_page) + 1} to {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                                </div>
                                <div className="flex items-center gap-2">
                                    {users.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground">
                                    {searchTerm ? 'No users found matching your search.' : 'No users have been registered yet.'}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit User Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={e => setEditData('name', e.target.value)}
                                    className={editErrors.name ? 'border-red-500' : ''}
                                />
                                {editErrors.name && <p className="text-sm text-red-500 mt-1">{editErrors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit-email">Email *</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editData.email}
                                    onChange={e => setEditData('email', e.target.value)}
                                    className={editErrors.email ? 'border-red-500' : ''}
                                />
                                {editErrors.email && <p className="text-sm text-red-500 mt-1">{editErrors.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editData.phone}
                                    onChange={e => setEditData('phone', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-role">Role *</Label>
                                <Select value={editData.role} onValueChange={(value) => setEditData('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="renter">Renter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editProcessing} className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editProcessing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete User Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
                                This action cannot be undone.
                            </p>
                            
                            <div className="flex gap-2 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setDeleteDialogOpen(false)} 
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    disabled={deletingId === userToDelete?.id}
                                    onClick={confirmDelete} 
                                    className="flex-1"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {deletingId === userToDelete?.id ? 'Deleting...' : 'Delete User'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}