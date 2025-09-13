import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminDashboard = () => {
  const { user, logout, apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateInstitutionModal, setShowCreateInstitutionModal] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'institutions') {
      fetchInstitutions();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Mock data for stats
      const mockStats = {
        users: {
          total: 25,
          super_admins: 1,
          admins: 3,
          alumni: 15,
          students: 6,
          active: 24
        },
        institutions: {
          total: 2
        }
      };
      
      try {
        const data = await apiCall('/api/super-admin/dashboard-stats');
        if (data.success) {
          setStats(data.stats);
        } else {
          throw new Error('API failed');
        }
      } catch (apiError) {
        console.log('API not available, using mock stats');
        setStats(mockStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock users data
      const mockUsers = [
        {
          id: 1,
          email: 'anydesk778@gmail.com',
          username: 'super_admin',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'super_admin',
          status: 'active',
          created_at: '2024-01-01T00:00:00',
          institution_id: null,
          institution_name: null,
          institution_type: null
        },
        {
          id: 2,
          email: 'john.doe@iitd.ac.in',
          username: 'john_alumni',
          first_name: 'John',
          last_name: 'Doe',
          role: 'alumni',
          status: 'active',
          created_at: '2024-02-15T00:00:00',
          institution_id: 1,
          institution_name: 'Indian Institute of Technology Delhi',
          institution_type: 'University'
        },
        {
          id: 3,
          email: 'jane.smith@mu.ac.in',
          username: 'jane_student',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'student',
          status: 'active',
          created_at: '2024-03-01T00:00:00',
          institution_id: 2,
          institution_name: 'University of Mumbai',
          institution_type: 'University'
        },
        {
          id: 4,
          email: 'admin@iitd.ac.in',
          username: 'iitd_admin',
          first_name: 'IIT Delhi',
          last_name: 'Admin',
          role: 'admin',
          status: 'active',
          created_at: '2024-01-20T00:00:00',
          institution_id: 1,
          institution_name: 'Indian Institute of Technology Delhi',
          institution_type: 'University'
        }
      ];
      
      try {
        const data = await apiCall('/api/super-admin/users');
        if (data.success) {
          setUsers(data.users);
          localStorage.setItem('mock_users', JSON.stringify(data.users));
          return;
        }
      } catch (apiError) {
        console.log('API not available, using stored/mock users');
      }
      
      // Use stored data or default mock data
      const storedUsers = localStorage.getItem('mock_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(mockUsers);
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      // Default mock data
      const defaultInstitutions = [
        {
          id: 1,
          name: 'Indian Institute of Technology Delhi',
          type: 'University',
          location: 'New Delhi, India',
          website: 'https://home.iitd.ac.in/',
          description: 'Premier engineering and technology institute',
          status: 'active',
          admin_count: 3,
          student_count: 250,
          alumni_count: 1200,
          created_at: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          name: 'University of Mumbai',
          type: 'University', 
          location: 'Mumbai, India',
          website: 'https://mu.ac.in/',
          description: 'Leading public university in Maharashtra',
          status: 'active',
          admin_count: 2,
          student_count: 180,
          alumni_count: 800,
          created_at: '2024-01-15T00:00:00'
        }
      ];
      
      // Try API call first
      try {
        const data = await apiCall('/api/super-admin/institutions');
        if (data.success) {
          setInstitutions(data.institutions);
          localStorage.setItem('mock_institutions', JSON.stringify(data.institutions));
          return;
        }
      } catch (apiError) {
        console.log('API not available, using stored/mock data');
      }
      
      // Use stored data or default mock data
      const storedInstitutions = localStorage.getItem('mock_institutions');
      if (storedInstitutions) {
        setInstitutions(JSON.parse(storedInstitutions));
      } else {
        setInstitutions(defaultInstitutions);
        localStorage.setItem('mock_institutions', JSON.stringify(defaultInstitutions));
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
    setLoading(false);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesInstitution = !institutionFilter || user.institution_id === institutionFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesInstitution && matchesStatus;
  });

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('-600', '-50')} ${color.replace('text', 'border').replace('-600', '-200')} border`}>
          <div className={`w-6 h-6 ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </button>
  );

  const CreateUserModal = () => {
    const [formData, setFormData] = useState({
      email: '',
      first_name: '',
      last_name: '',
      role: 'alumni',
      institution_id: '',
      graduation_year: '',
      department: ''
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setCreating(true);
      
      try {
        // Find institution name for the selected institution
        const selectedInstitution = institutions.find(inst => inst.id == formData.institution_id);
        
        // Try API call first
        try {
          const data = await apiCall('/api/super-admin/create-user', {
            method: 'POST',
            body: JSON.stringify(formData)
          });
          
          if (data.success) {
            alert('User profile added successfully! An email invitation will be sent.');
            setShowCreateUserModal(false);
            fetchUsers();
            resetForm();
          } else {
            alert(data.error || 'Failed to create user');
          }
        } catch (apiError) {
          console.log('API not available, using mock user creation');
          
          // Mock user creation
          const newUser = {
            id: Date.now(),
            email: formData.email,
            username: formData.email.split('@')[0], // Generate username from email
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            status: 'pending_activation', // User needs to claim profile
            created_at: new Date().toISOString(),
            institution_id: formData.institution_id || null,
            institution_name: selectedInstitution?.name || null,
            institution_type: selectedInstitution?.type || null,
            graduation_year: formData.graduation_year,
            department: formData.department
          };
          
          // Add to stored users
          const storedUsers = localStorage.getItem('mock_users');
          const currentUsers = storedUsers ? JSON.parse(storedUsers) : users;
          const updatedUsers = [...currentUsers, newUser];
          
          localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
          setUsers(updatedUsers);
          
          alert(`User profile added successfully! (Mock mode)\n\n📧 In real system: An email invitation would be sent to ${formData.email} to claim their profile.`);
          setShowCreateUserModal(false);
          resetForm();
        }
      } catch (error) {
        alert('Error adding user: ' + error.message);
      }
      setCreating(false);
    };
    
    const resetForm = () => {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'alumni',
        institution_id: '',
        graduation_year: '',
        department: ''
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add User Profile</h3>
            <button
              onClick={() => setShowCreateUserModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Note:</strong> Username and password will be set when the user claims their profile via email invitation.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="alumni">Alumni</option>
              <option value="student">Student</option>
              <option value="admin">Institution Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            
            {/* Institution and Academic Details - required for alumni and students */}
            {(formData.role === 'alumni' || formData.role === 'student') && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Academic Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution *
                  </label>
                  <select
                    value={formData.institution_id}
                    onChange={(e) => setFormData({...formData, institution_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                  {institutions.length === 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ No institutions available. Please add an institution first.
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.role === 'alumni' ? 'Graduation Year' : 'Expected Graduation'}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({...formData, graduation_year: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1950"
                      max="2030"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department/Course
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Adding...' : 'Add User Profile'}
                  </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreateInstitutionModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'University',
      location: '',
      website: '',
      description: ''
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setCreating(true);
      
      try {
        console.log('Creating institution with data:', formData);
        
        // Try API call first, fall back to mock creation
        try {
          const data = await apiCall('/api/super-admin/create-institution', {
            method: 'POST',
            body: JSON.stringify(formData)
          });
          console.log('Institution creation response:', data);
          
          if (data.success) {
            alert('Institution created successfully!');
            setShowCreateInstitutionModal(false);
            fetchInstitutions();
            setFormData({
              name: '',
              type: 'University',
              location: '',
              website: '',
              description: ''
            });
          } else {
            alert(data.error || 'Failed to create institution');
          }
        } catch (apiError) {
          console.log('API not available, using mock creation');
          
          // Mock creation - add to current list and persist
          const newInstitution = {
            id: Date.now(), // Simple ID generation
            ...formData,
            status: 'active',
            admin_count: 0,
            student_count: 0,
            alumni_count: 0,
            created_at: new Date().toISOString()
          };
          
          const updatedInstitutions = [...institutions, newInstitution];
          setInstitutions(updatedInstitutions);
          localStorage.setItem('mock_institutions', JSON.stringify(updatedInstitutions));
          alert('Institution created successfully! (Mock mode)');
          setShowCreateInstitutionModal(false);
          setFormData({
            name: '',
            type: 'University',
            location: '',
            website: '',
            description: ''
          });
        }
      } catch (error) {
        alert('Error creating institution: ' + error.message);
      }
      setCreating(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Create New Institution</h3>
            <button
              onClick={() => setShowCreateInstitutionModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name *</label>
              <input
                type="text"
                placeholder="Enter institution name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Institute">Institute</option>
                <option value="School">School</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                placeholder="City, State/Country"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                placeholder="https://example.edu"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Brief description about the institution"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateInstitutionModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Institution'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.first_name} {user?.last_name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="users"
            label="All Users"
            isActive={activeTab === 'users'}
            onClick={setActiveTab}
          />
          <TabButton
            id="institutions"
            label="Institutions"
            isActive={activeTab === 'institutions'}
            onClick={setActiveTab}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            isActive={activeTab === 'analytics'}
            onClick={setActiveTab}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    color="text-blue-600"
                    description="Active platform users"
                    icon="👥"
                  />
                  <StatCard
                    title="Institutions"
                    value={stats.institutions.total}
                    color="text-green-600"
                    description="Registered institutions"
                    icon="🏢"
                  />
                  <StatCard
                    title="Alumni"
                    value={stats.users.alumni}
                    color="text-purple-600"
                    description="Alumni members"
                    icon="🎓"
                  />
                  <StatCard
                    title="Students"
                    value={stats.users.students}
                    color="text-orange-600"
                    description="Active students"
                    icon="📚"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Super Admins</span>
                        <span className="font-medium">{stats.users.super_admins}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admins</span>
                        <span className="font-medium">{stats.users.admins}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Alumni</span>
                        <span className="font-medium">{stats.users.alumni}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students</span>
                        <span className="font-medium">{stats.users.students}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowCreateUserModal(true)}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                      >
                        <div className="text-2xl mb-2">👤</div>
                        <div className="font-medium text-gray-900">Create User</div>
                        <div className="text-sm text-gray-500">Add new user to system</div>
                      </button>
                      <button
                        onClick={() => setActiveTab('institutions')}
                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                      >
                        <div className="text-2xl mb-2">🏢</div>
                        <div className="font-medium text-gray-900">Manage Institutions</div>
                        <div className="text-sm text-gray-500">View and manage institutions</div>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load dashboard statistics</p>
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Users</h2>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </button>
            </div>
            
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                
                {/* Institution Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                  <select
                    value={institutionFilter}
                    onChange={(e) => setInstitutionFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Institutions</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              {(searchTerm || roleFilter || institutionFilter || statusFilter) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('');
                      setInstitutionFilter('');
                      setStatusFilter('');
                    }}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
              {(searchTerm || roleFilter || institutionFilter || statusFilter) && (
                <span className="text-blue-600 font-medium"> (filtered)</span>
              )}
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">
                  {users.length === 0 ? 'No users in the system yet.' : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.institution_name ? (
                              <div>
                                <div className="font-medium">{user.institution_name}</div>
                                <div className="text-gray-500 text-xs">{user.institution_type}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No institution</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'alumni' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Institutions Tab */}
        {activeTab === 'institutions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Institution Management</h2>
              <button 
                onClick={() => setShowCreateInstitutionModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Institution
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institutions.map((institution) => (
                  <div key={institution.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{institution.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{institution.type} • {institution.location}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{institution.admin_count} Admins</span>
                          <span>{institution.student_count} Students</span>
                          <span>{institution.alumni_count} Alumni</span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        institution.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {institution.status}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Advanced analytics and reporting features will be available here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && <CreateUserModal />}
      
      {/* Create Institution Modal */}
      {showCreateInstitutionModal && <CreateInstitutionModal />}
    </div>
  );
};

export default SuperAdminDashboard;
