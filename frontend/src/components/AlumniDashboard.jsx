import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AlumniDashboard = () => {
  const { user, logout, apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [dashboardMode, setDashboardMode] = useState('institute'); // 'institute' or 'global'
  const [profilePublicationEnabled, setProfilePublicationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Dashboard data states
  const [feedData, setFeedData] = useState([]);
  const [connections, setConnections] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadUserSettings();
  }, [dashboardMode]);

  const loadUserSettings = async () => {
    try {
      // Load user's profile publication setting
      const response = await apiCall('/api/alumni/settings');
      if (response.success) {
        setProfilePublicationEnabled(response.settings.profilePublicationEnabled || false);
      }
    } catch (error) {
      console.log('Using default settings - API not available');
      // Use localStorage for offline functionality
      const savedSettings = localStorage.getItem('alumni_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setProfilePublicationEnabled(settings.profilePublicationEnabled || false);
      }
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load different data based on dashboard mode
      if (dashboardMode === 'institute') {
        await loadInstituteData();
      } else {
        await loadGlobalData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      loadMockData();
    }
    setLoading(false);
  };

  const loadInstituteData = async () => {
    try {
      const [feedRes, connectionsRes, eventsRes, jobsRes] = await Promise.all([
        apiCall('/api/alumni/institute/feed'),
        apiCall('/api/alumni/institute/connections'),
        apiCall('/api/alumni/institute/events'),
        apiCall('/api/alumni/institute/jobs')
      ]);

      setFeedData(feedRes.success ? feedRes.feed : []);
      setConnections(connectionsRes.success ? connectionsRes.connections : []);
      setEvents(eventsRes.success ? eventsRes.events : []);
      setJobs(jobsRes.success ? jobsRes.jobs : []);
    } catch (error) {
      loadMockInstituteData();
    }
  };

  const loadGlobalData = async () => {
    try {
      const [feedRes, connectionsRes, eventsRes, jobsRes] = await Promise.all([
        apiCall('/api/alumni/global/feed'),
        apiCall('/api/alumni/global/connections'),
        apiCall('/api/alumni/global/events'),
        apiCall('/api/alumni/global/jobs')
      ]);

      setFeedData(feedRes.success ? feedRes.feed : []);
      setConnections(connectionsRes.success ? connectionsRes.connections : []);
      setEvents(eventsRes.success ? eventsRes.events : []);
      setJobs(jobsRes.success ? jobsRes.jobs : []);
    } catch (error) {
      loadMockGlobalData();
    }
  };

  const loadMockData = () => {
    if (dashboardMode === 'institute') {
      loadMockInstituteData();
    } else {
      loadMockGlobalData();
    }
  };

  const loadMockInstituteData = () => {
    setFeedData([
      {
        id: 1,
        type: 'announcement',
        title: 'Alumni Reunion 2025 Registration Open',
        content: 'Join us for the biggest alumni gathering! Register now for early bird pricing.',
        author: 'IIT Delhi Alumni Office',
        timestamp: '2024-12-13T10:30:00Z',
        likes: 45,
        comments: 12
      },
      {
        id: 2,
        type: 'achievement',
        title: 'Congratulations to Rahul Sharma (Class of 2018)',
        content: 'Just got promoted to Senior Software Engineer at Google!',
        author: 'Rahul Sharma',
        timestamp: '2024-12-12T15:45:00Z',
        likes: 89,
        comments: 23
      }
    ]);

    setConnections([
      { id: 1, name: 'Priya Patel', batch: '2019', department: 'CSE', company: 'Microsoft' },
      { id: 2, name: 'Arjun Kumar', batch: '2017', department: 'ECE', company: 'Samsung' },
      { id: 3, name: 'Sneha Reddy', batch: '2020', department: 'CSE', company: 'Amazon' }
    ]);

    setEvents([
      {
        id: 1,
        title: 'Tech Talk: AI in Healthcare',
        date: '2024-12-20',
        type: 'virtual',
        attendees: 150
      },
      {
        id: 2,
        title: 'Annual Alumni Meet',
        date: '2024-12-25',
        type: 'physical',
        location: 'IIT Delhi Campus'
      }
    ]);

    setJobs([
      {
        id: 1,
        title: 'Senior Software Developer',
        company: 'TechCorp India',
        location: 'Bangalore',
        type: 'Full-time',
        postedBy: 'alumni'
      }
    ]);
  };

  const loadMockGlobalData = () => {
    setFeedData([
      {
        id: 1,
        type: 'professional_update',
        title: 'Industry Insight: The Future of AI',
        content: 'Sharing my thoughts on how AI will transform various industries in the next decade.',
        author: 'Dr. Sarah Chen (MIT Alumni)',
        timestamp: '2024-12-13T09:15:00Z',
        likes: 234,
        comments: 67
      },
      {
        id: 2,
        type: 'career_move',
        title: 'Exciting Career Move!',
        content: 'Thrilled to announce my new role as CTO at InnovateTech. Looking forward to this new challenge!',
        author: 'Michael Rodriguez (Stanford Alumni)',
        timestamp: '2024-12-12T14:20:00Z',
        likes: 156,
        comments: 45
      }
    ]);

    setConnections([
      { id: 1, name: 'Elena Vasquez', university: 'Stanford', field: 'AI Research', company: 'OpenAI' },
      { id: 2, name: 'James Wilson', university: 'MIT', field: 'Robotics', company: 'Boston Dynamics' },
      { id: 3, name: 'Li Wei', university: 'Tsinghua', field: 'Quantum Computing', company: 'IBM Research' }
    ]);

    setEvents([
      {
        id: 1,
        title: 'Global Tech Summit 2025',
        date: '2025-01-15',
        type: 'hybrid',
        attendees: 5000,
        global: true
      },
      {
        id: 2,
        title: 'Cross-University Innovation Challenge',
        date: '2025-02-01',
        type: 'virtual',
        universities: ['MIT', 'Stanford', 'IIT']
      }
    ]);

    setJobs([
      {
        id: 1,
        title: 'Principal Engineer - AI/ML',
        company: 'Google DeepMind',
        location: 'London, UK',
        type: 'Full-time',
        global: true
      },
      {
        id: 2,
        title: 'Senior Product Manager',
        company: 'Meta',
        location: 'Remote',
        type: 'Full-time',
        global: true
      }
    ]);
  };

  const toggleProfilePublication = async (enabled) => {
    try {
      const response = await apiCall('/api/alumni/settings', {
        method: 'PUT',
        body: JSON.stringify({ profilePublicationEnabled: enabled })
      });

      if (response.success) {
        setProfilePublicationEnabled(enabled);
        if (!enabled) {
          setDashboardMode('institute'); // Reset to institute mode if disabled
        }
      }
    } catch (error) {
      // Fallback to localStorage
      const settings = { profilePublicationEnabled: enabled };
      localStorage.setItem('alumni_settings', JSON.stringify(settings));
      setProfilePublicationEnabled(enabled);
      if (!enabled) {
        setDashboardMode('institute');
      }
    }
  };

  const TabButton = ({ id, label, isActive, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  const StatCard = ({ title, value, change, icon, color = "text-blue-600" }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`text-3xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {dashboardMode === 'institute' ? 'Institute Dashboard' : 'Global Dashboard'}
              </h1>
              
              {/* Dashboard Mode Toggle - Only visible when profile publication is enabled */}
              {profilePublicationEnabled && (
                <div className="flex items-center gap-2 ml-6">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <div className="relative">
                    <button
                      onClick={() => setDashboardMode(dashboardMode === 'institute' ? 'global' : 'institute')}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        dashboardMode === 'global' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                          dashboardMode === 'global' ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {dashboardMode === 'institute' ? '🏫 Institute' : '🌍 Global'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">Welcome back, {user?.first_name}</p>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Profile Visibility</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Profile Publication</p>
                    <p className="text-sm text-gray-600">
                      Enable global visibility and cross-institution networking
                    </p>
                  </div>
                  <button
                    onClick={() => toggleProfilePublication(!profilePublicationEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      profilePublicationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        profilePublicationEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {!profilePublicationEnabled && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Global dashboard features are disabled. Enable profile publication to access cross-institution networking.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <TabButton
            id="feed"
            label={dashboardMode === 'institute' ? 'Institute Feed' : 'Global Feed'}
            isActive={activeTab === 'feed'}
            onClick={setActiveTab}
          />
          <TabButton
            id="connections"
            label="Connections"
            isActive={activeTab === 'connections'}
            onClick={setActiveTab}
            badge={connections.length}
          />
          <TabButton
            id="events"
            label="Events"
            isActive={activeTab === 'events'}
            onClick={setActiveTab}
          />
          <TabButton
            id="jobs"
            label={dashboardMode === 'institute' ? 'Campus Jobs' : 'Global Opportunities'}
            isActive={activeTab === 'jobs'}
            onClick={setActiveTab}
          />
          <TabButton
            id="profile"
            label="My Profile"
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={dashboardMode === 'institute' ? 'Institute Connections' : 'Global Network'}
            value={connections.length}
            change="+3"
            icon="👥"
            color="text-blue-600"
          />
          <StatCard
            title="Upcoming Events"
            value={events.length}
            icon="📅"
            color="text-green-600"
          />
          <StatCard
            title={dashboardMode === 'institute' ? 'Campus Jobs' : 'Global Jobs'}
            value={jobs.length}
            change="+5"
            icon="💼"
            color="text-purple-600"
          />
          <StatCard
            title="Profile Views"
            value="47"
            change="+12"
            icon="👁️"
            color="text-orange-600"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {dashboardMode === 'institute' ? 'Institute Activity Feed' : 'Global Professional Feed'}
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading feed...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedData.map(post => (
                    <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {post.author}</span>
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {dashboardMode === 'institute' ? 'Institute Alumni Network' : 'Global Professional Network'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map(connection => (
                  <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                    {dashboardMode === 'institute' ? (
                      <>
                        <p className="text-sm text-gray-600">Batch: {connection.batch}</p>
                        <p className="text-sm text-gray-600">Department: {connection.department}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">University: {connection.university}</p>
                        <p className="text-sm text-gray-600">Field: {connection.field}</p>
                      </>
                    )}
                    <p className="text-sm text-gray-600">Company: {connection.company}</p>
                    <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {dashboardMode === 'institute' ? 'Institute Events' : 'Global Events & Conferences'}
              </h2>
              
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">Date: {event.date}</p>
                        <p className="text-sm text-gray-600">Type: {event.type}</p>
                        {event.location && (
                          <p className="text-sm text-gray-600">Location: {event.location}</p>
                        )}
                        {event.universities && (
                          <p className="text-sm text-gray-600">Universities: {event.universities.join(', ')}</p>
                        )}
                      </div>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {dashboardMode === 'institute' ? 'Campus Job Opportunities' : 'Global Career Opportunities'}
              </h2>
              
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">Company: {job.company}</p>
                        <p className="text-sm text-gray-600">Location: {job.location}</p>
                        <p className="text-sm text-gray-600">Type: {job.type}</p>
                        {job.postedBy && (
                          <p className="text-sm text-gray-500">Posted by: {job.postedBy}</p>
                        )}
                      </div>
                      <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Profile</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-gray-600">Role: {user?.role}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <h4 className="font-semibold mb-2">Visibility Status</h4>
                    <p className={`text-sm ${profilePublicationEnabled ? 'text-green-600' : 'text-orange-600'}`}>
                      {profilePublicationEnabled ? '🌍 Global Profile Active' : '🏫 Institute Only'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Dashboard Mode</h4>
                    <p className="text-sm text-gray-600">
                      {dashboardMode === 'institute' ? '🏫 Institute Dashboard' : '🌍 Global Dashboard'}
                    </p>
                  </div>
                </div>

                <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;
