'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  Mail,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  XCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface User {
  username: string
  password: string
  role: 'admin' | 'investor'
  name: string
  email?: string
  lastLogin?: string
  isActive: boolean
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
}

export default function UserManagementModal({ 
  isOpen, 
  onClose, 
  onUserUpdated 
}: UserManagementModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({})
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'investor' as 'admin' | 'investor',
    isActive: true
  })
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'investor' as 'admin' | 'investor',
    isActive: true
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/users.json')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      showMessage('error', 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleAddUser = async () => {
    if (!newUserForm.username || !newUserForm.name) {
      showMessage('error', 'Username and name are required')
      return
    }

    // Check if username already exists
    if (users.find(u => u.username === newUserForm.username)) {
      showMessage('error', 'Username already exists')
      return
    }

    setActionLoading('add')
    try {
      const newUser: User = {
        ...newUserForm,
        password: newUserForm.password || generatePassword(),
        lastLogin: undefined
      }

      const updatedUsers = [...users, newUser]
      
      // In a real app, this would be an API call
      // For now, we'll simulate success
      setUsers(updatedUsers)
      setNewUserForm({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'investor',
        isActive: true
      })
      setShowAddForm(false)
      showMessage('success', `User "${newUser.name}" added successfully`)
      onUserUpdated()
    } catch (error) {
      showMessage('error', 'Failed to add user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user.username)
    setEditForm({
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email || '',
      role: user.role,
      isActive: user.isActive
    })
  }

  const handleSaveEdit = async (username: string) => {
    setActionLoading(username)
    try {
      const updatedUsers = users.map(user => 
        user.username === username 
          ? { ...user, ...editForm }
          : user
      )
      
      setUsers(updatedUsers)
      setEditingUser(null)
      showMessage('success', 'User updated successfully')
      onUserUpdated()
    } catch (error) {
      showMessage('error', 'Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'investor',
      isActive: true
    })
  }

  const handleDelete = async (username: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return
    }

    setActionLoading(username)
    try {
      const updatedUsers = users.filter(user => user.username !== username)
      setUsers(updatedUsers)
      showMessage('success', 'User deleted successfully')
      onUserUpdated()
    } catch (error) {
      showMessage('error', 'Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const togglePasswordVisibility = (username: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showMessage('success', 'Copied to clipboard')
  }

  const generateLoginLink = (username: string, password: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}?user=${encodeURIComponent(username)}&pass=${encodeURIComponent(password)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Add User Button */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Add User Form */}
        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="investor3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave empty to auto-generate"
                  />
                  <button
                    onClick={() => setNewUserForm({ ...newUserForm, password: generatePassword() })}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as 'admin' | 'investor' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="investor">Investor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newUserForm.isActive}
                  onChange={(e) => setNewUserForm({ ...newUserForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={handleAddUser}
                disabled={actionLoading === 'add'}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === 'add' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Add User</span>
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.username} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${user.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-red-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingUser === user.username ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                                <input
                                  type="text"
                                  value={editForm.username}
                                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  disabled
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                <div className="flex space-x-1">
                                  <input
                                    type="text"
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  <button
                                    onClick={() => setEditForm({ ...editForm, password: generatePassword() })}
                                    className="px-2 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                  >
                                    <Key className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                <select
                                  value={editForm.role}
                                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'investor' })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                  <option value="investor">Investor</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editForm.isActive}
                                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Active</label>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSaveEdit(user.username)}
                                disabled={actionLoading === user.username}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                              >
                                {actionLoading === user.username ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center space-x-1 px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">{user.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                              {!user.isActive && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Username: {user.username}</span>
                              </div>
                              {user.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{user.email}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Key className="w-4 h-4" />
                                <span>Password: </span>
                                <span className="font-mono">
                                  {showPasswords[user.username] ? user.password : '••••••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordVisibility(user.username)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {showPasswords[user.username] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  onClick={() => copyToClipboard(user.password)}
                                  className="p-1 hover:bg-gray-200 rounded"
                                  title="Copy password"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>Login Link:</span>
                                <button
                                  onClick={() => copyToClipboard(generateLoginLink(user.username, user.password))}
                                  className="text-blue-600 hover:text-blue-700 underline text-xs"
                                  title="Copy login link"
                                >
                                  Copy direct login link
                                </button>
                              </div>
                              {user.lastLogin && (
                                <div className="text-xs text-gray-400">
                                  Last login: {user.lastLogin}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editingUser !== user.username && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit user"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.username, user.name)}
                          disabled={actionLoading === user.username}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Delete user"
                        >
                          {actionLoading === user.username ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {users.length} user{users.length !== 1 ? 's' : ''} total
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

