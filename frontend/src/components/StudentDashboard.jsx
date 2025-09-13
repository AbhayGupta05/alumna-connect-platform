import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { user, logout, apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(false);
  
  // Dashboard data states
  const [feedData, setFeedData] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [events, setEvents] = useState([]);
  const [internships, setInternships] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all student dashboard data
      const [feedRes, mentorsRes, eventsRes, internshipsRes] = await Promise.all([
        apiCall('/api/student/campus/feed'),
        apiCall('/api/student/mentors'),
        apiCall('/api/student/events'),
        apiCall('/api/student/internships')
      ]);

      setFeedData(feedRes.success ? feedRes.feed : loadMockFeed());
      setMentors(mentorsRes.success ? mentorsRes.mentors : loadMockMentors());
      setEvents(eventsRes.success ? eventsRes.events : loadMockEvents());
      setInternships(internshipsRes.success ? internshipsRes.internships : loadMockInternships());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Load mock data as fallback
      setFeedData(loadMockFeed());
      setMentors(loadMockMentors());
      setEvents(loadMockEvents());
      setInternships(loadMockInternships());
    }
    setLoading(false);
  };

  const loadMockFeed = () => [
    {
      id: 1,
      type: 'announcement',
      title: 'Final Exam Schedule Released',
      content: 'Check your student portal for the complete exam schedule. All students must register before the deadline.',
      author: 'Academic Office',
      timestamp: '2024-12-13T11:00:00Z',
      likes: 23,
      comments: 8,
      priority: 'high'
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Summer Internship Applications Open',
      content: 'Apply now for summer internships with our partner companies. Deadline: January 15th.',
      author: 'Career Services',
      timestamp: '2024-12-12T14:30:00Z',
      likes: 67,
      comments: 15,
      priority: 'medium'
    }
  ];

  const loadMockMentors = () => [
    {
      id: 1,
      name: 'John Doe',
      position: 'Senior Software Engineer at Google',
      graduation_year: '2018',
      department: 'Computer Science',
      expertise: ['Software Development', 'System Design', 'Career Guidance'],
      availability: 'Available',
      rating: 4.8,
      total_mentees: 12
    },
    {
      id: 2,
      name: 'Priya Patel',
      position: 'Product Manager at Microsoft',
      graduation_year: '2019',
      department: 'Computer Science',
      expertise: ['Product Management', 'Strategy', 'Leadership'],
      availability: 'Limited',
      rating: 4.9,
      total_mentees: 8
    }
  ];

  const loadMockEvents = () => [
    {
      id: 1,
      title: 'Career Fair 2024',
      date: '2024-12-20',
      time: '10:00 AM',
      location: 'Student Center',
      type: 'career',
      attendees: 234,
      registered: true
    },
    {
      id: 2,
      title: 'Tech Talk: AI in Industry',
      date: '2024-12-22',
      time: '2:00 PM',
      location: 'Auditorium Hall',
      type: 'academic',
      attendees: 89,
      registered: false
    }
  ];

  const loadMockInternships = () => [
    {
      id: 1,
      title: 'Software Development Intern',
      company: 'TechStart Inc.',
      location: 'Bangalore',
      duration: '3 months',
      stipend: '₹25,000/month',
      deadline: '2025-01-15',
      requirements: ['Python', 'JavaScript', 'Database'],
      applied: false
    },
    {
      id: 2,
      title: 'Data Science Intern',
      company: 'Analytics Pro',
      location: 'Mumbai',
      duration: '6 months',
      stipend: '₹30,000/month',
      deadline: '2025-01-20',
      requirements: ['Python', 'Machine Learning', 'Statistics'],
      applied: true
    }
  ];

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

  const getStatusBadge = (status) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🎓 Campus Dashboard
              </h1>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <span className="text-xs font-medium text-blue-600">STUDENT MODE</span>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">Welcome, {user?.first_name}</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                  🔔
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Account Limitations Notice */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="text-orange-500 text-xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-orange-800">Student Account Limitations</h3>
              <p className="text-sm text-orange-700 mt-1">
                As a student, your access is limited to campus resources only. Global networking features will be available once you graduate and become an alumni.
              </p>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Campus-Only</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">No Cross-Institution</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Alumni Mentorship Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <TabButton
            id="feed"
            label="Campus Feed"
            isActive={activeTab === 'feed'}
            onClick={setActiveTab}
          />
          <TabButton
            id="mentors"
            label="Alumni Mentors"
            isActive={activeTab === 'mentors'}
            onClick={setActiveTab}
            badge={mentors.filter(m => m.availability === 'Available').length}
          />
          <TabButton
            id="events"
            label="Campus Events"
            isActive={activeTab === 'events'}
            onClick={setActiveTab}
          />
          <TabButton
            id="internships"
            label="Internships"
            isActive={activeTab === 'internships'}
            onClick={setActiveTab}
            badge={internships.filter(i => !i.applied).length}
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
            title="Available Mentors"
            value={mentors.filter(m => m.availability === 'Available').length}
            icon="👨‍🏫"
            color="text-blue-600"
          />
          <StatCard
            title="Upcoming Events"
            value={events.length}
            icon="📅"
            color="text-green-600"
          />
          <StatCard
            title="Open Internships"
            value={internships.filter(i => !i.applied).length}
            change="+2"
            icon="💼"
            color="text-purple-600"
          />
          <StatCard
            title="Campus Connections"
            value="34"
            change="+5"
            icon="🤝"
            color="text-orange-600"
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📢 Campus Activity Feed
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading campus feed...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedData.map(post => (
                    <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{post.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(post.priority)}`}>
                            {post.priority}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {post.author}</span>
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                        <span className="text-blue-600 hover:underline cursor-pointer">Read More</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                👨‍🏫 Alumni Mentors from Your Campus
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        mentor.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {mentor.availability}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{mentor.position}</p>
                    <p className="text-xs text-gray-500 mb-2">Class of {mentor.graduation_year} • {mentor.department}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mentor.expertise.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>⭐ {mentor.rating}/5.0</span>
                      <span>{mentor.total_mentees} mentees</span>
                    </div>
                    
                    <button 
                      className={`w-full px-3 py-2 text-sm rounded ${
                        mentor.availability === 'Available' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={mentor.availability !== 'Available'}
                    >
                      {mentor.availability === 'Available' ? 'Request Mentorship' : 'Currently Full'}
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
                📅 Campus Events
              </h2>
              
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            event.type === 'career' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                          <span>📅 {event.date} at {event.time}</span>
                          <span>📍 {event.location}</span>
                          <span>👥 {event.attendees} attending</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {event.registered ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            ✓ Registered
                          </span>
                        ) : (
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'internships' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                💼 Internship Opportunities
              </h2>
              
              <div className="space-y-4">
                {internships.map(internship => (
                  <div key={internship.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{internship.title}</h3>
                          {internship.applied && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Applied
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>{internship.company}</strong> • {internship.location}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                          <span>⏰ {internship.duration}</span>
                          <span>💰 {internship.stipend}</span>
                          <span>📅 Deadline: {internship.deadline}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {internship.requirements.map((req, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        {internship.applied ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                            Application Sent
                          </span>
                        ) : (
                          <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                            Apply Now
                          </button>
                        )}
                      </div>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Student Profile</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-gray-600">Role: {user?.role}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded mt-1">
                      Student Account
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-2 text-orange-800">Account Limitations</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>✓ Access to campus resources only</li>
                      <li>✓ Connect with alumni mentors</li>
                      <li>✗ No global networking access</li>
                      <li>✗ No cross-institution features</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 text-green-800">Available Features</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✓ Campus event registration</li>
                      <li>✓ Internship applications</li>
                      <li>✓ Alumni mentorship program</li>
                      <li>✓ Career guidance resources</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800">🎓 After Graduation</h4>
                  <p className="text-sm text-blue-700">
                    Once you graduate, your account will be automatically upgraded to Alumni status with access to:
                    global networking, cross-institution connections, advanced career opportunities, and more!
                  </p>
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

export default StudentDashboard;
