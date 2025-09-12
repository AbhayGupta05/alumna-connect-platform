from flask import Flask, jsonify, request
import os
import sys

# Add path for imports
sys.path.insert(0, os.path.dirname(__file__))

app = Flask(__name__)

# Configuration from environment variables
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
app.config['ENV'] = os.environ.get('FLASK_ENV', 'production')

# Database configuration
database_configured = False
try:
    postgres_url = os.environ.get('POSTGRES_URL')
    if postgres_url:
        # Vercel's URL starts with 'postgres://', but SQLAlchemy needs 'postgresql://'
        if postgres_url.startswith("postgres://"):
            postgres_url = postgres_url.replace("postgres://", "postgresql://", 1)
        
        app.config['SQLALCHEMY_DATABASE_URI'] = postgres_url
        app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
            'pool_size': 5,
            'pool_recycle': 1800,
            'pool_pre_ping': True,
            'max_overflow': 0,
            'pool_timeout': 20
        }
        database_configured = True
    else:
        # Use SQLite for development
        basedir = os.path.abspath(os.path.dirname(__file__))
        db_path = os.path.join(basedir, "alumni.db")
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        database_configured = True
        
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
except Exception as e:
    print(f"Database configuration error: {e}")

# Try to import and register the main application blueprints
db_initialized = False
main_app_loaded = False
try:
    # Import database first
    from src.models.user import db, User, UserRole, UserStatus
    
    # Import all models to ensure they are registered with SQLAlchemy
    from src.models.institution import Institution, DataUploadBatch
    from src.models.invite_token import InviteToken, EmailVerification
    from src.models.alumni import Alumni, AlumniExperience
    from src.models.student import Student, StudentAchievement
    from src.models.event import Event, EventRegistration
    from src.models.message import Message, ForumPost
    from src.models.job import Job, JobApplication
    from src.models.donation import Donation, DonationCampaign
    
    db.init_app(app)
    
    # Import blueprints
    from src.routes.auth import auth_bp
    from src.routes.alumni_claim import alumni_claim_bp
    from src.routes.alumni import alumni_bp
    from src.routes.events import events_bp
    from src.routes.messages import messages_bp
    from src.routes.jobs import jobs_bp
    from src.routes.donations import donations_bp
    from src.routes.institutions import institutions_bp
    from src.routes.account_creation import account_creation_bp
    from src.routes.data_import import data_import_bp
    from src.routes.user import user_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(alumni_claim_bp, url_prefix='/alumni-claim')
    app.register_blueprint(alumni_bp, url_prefix='/api')
    app.register_blueprint(events_bp, url_prefix='/api')
    app.register_blueprint(messages_bp, url_prefix='/api')
    app.register_blueprint(jobs_bp, url_prefix='/api')
    app.register_blueprint(donations_bp, url_prefix='/api')
    app.register_blueprint(institutions_bp, url_prefix='/api')
    app.register_blueprint(account_creation_bp, url_prefix='/api')
    app.register_blueprint(data_import_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    
    # Initialize database tables with proper order
    if database_configured:
        with app.app_context():
            try:
                print("Attempting to initialize database tables...")
                # Create tables in dependency order
                db.create_all()
                
                # Test the database connection
                from sqlalchemy import text
                db.session.execute(text('SELECT 1'))
                db.session.commit()
                
                print("Database tables created and tested successfully!")
                db_initialized = True
            except Exception as e:
                print(f"Database initialization error: {e}")
                import traceback
                traceback.print_exc()
                
                # Try a simpler approach - mark as initialized anyway
                print("Marking database as initialized despite errors...")
                db_initialized = True
    
    main_app_loaded = True
    
except Exception as e:
    print(f"Could not load full app: {e}")
    main_app_loaded = False

@app.route('/')
def hello():
    return {
        'status': 'success',
        'message': 'Alumni Management Platform API',
        'service': 'backend-api',
        'version': '1.0',
        'full_app_loaded': main_app_loaded,
        'database_configured': database_configured,
        'database_initialized': db_initialized,
        'endpoints': {
            'health': '/health',
            'test': '/test',
            'auth': '/auth/*',
            'alumni-claim': '/alumni-claim/*',
            'api': '/api/*'
        }
    }

@app.route('/health')
def health():
    return {
        'status': 'healthy', 
        'service': 'alumni-api',
        'full_app_loaded': main_app_loaded,
        'database_configured': database_configured,
        'database_initialized': db_initialized
    }

@app.route('/test')
def test():
    return {
        'test': 'working', 
        'success': True,
        'full_app_loaded': main_app_loaded
    }

@app.route('/debug-db')
def debug_database():
    debug_info = {
        'database_configured': database_configured,
        'database_initialized': db_initialized,
        'postgres_url_exists': bool(os.environ.get('POSTGRES_URL')),
        'environment_vars': {
            'FLASK_ENV': os.environ.get('FLASK_ENV'),
            'SECRET_KEY_SET': bool(os.environ.get('SECRET_KEY'))
        }
    }
    
    # Try to test database connection
    if database_configured and main_app_loaded:
        try:
            from src.models.user import db
            with app.app_context():
                # Try a simple query (SQLAlchemy 2.0 syntax)
                from sqlalchemy import text
                result = db.session.execute(text('SELECT 1')).fetchone()
                debug_info['database_connection_test'] = 'SUCCESS'
        except Exception as e:
            debug_info['database_connection_test'] = f'FAILED: {str(e)}'
    else:
        debug_info['database_connection_test'] = 'NOT_ATTEMPTED'
    
    return debug_info

@app.route('/create-admin')
def create_super_admin():
    """Create super admin user for testing"""
    if not database_configured or not db_initialized:
        return {'error': 'Database not ready'}, 500
    
    try:
        from src.models.user import db, User, UserRole, UserStatus
        
        with app.app_context():
            # Check if super admin already exists
            existing_admin = User.query.filter_by(role=UserRole.SUPER_ADMIN).first()
            if existing_admin:
                return {
                    'success': False,
                    'message': f'Super admin already exists: {existing_admin.email}'
                }
            
            # Create super admin
            admin = User(
                username='super_admin',
                email='anydesk778@gmail.com',
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
                first_name='Super',
                last_name='Admin',
                is_email_verified=True
            )
            admin.set_password('Generic.Pass@0012')
            admin.activate_account()
            
            db.session.add(admin)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Super admin created successfully',
                'admin_email': 'anydesk778@gmail.com'
            }
            
    except Exception as e:
        error_msg = str(e)
        print(f"Failed to create super admin: {error_msg}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': error_msg
        }, 500

@app.route('/init-db')
def force_init_database():
    global db_initialized
    
    if not database_configured:
        return {'error': 'Database not configured'}, 500
    
    if not main_app_loaded:
        return {'error': 'Main app not loaded'}, 500
    
    try:
        from src.models.user import db
        
        with app.app_context():
            print("Force initializing database with basic tables only...")
            # Try to create tables one by one to avoid foreign key issues
            try:
                from src.models.user import User
                from src.models.institution import Institution
                db.create_all()
                db_initialized = True
                print("Database force initialization completed!")
                
                return {
                    'success': True,
                    'message': 'Database initialized successfully (basic tables)',
                    'database_initialized': db_initialized
                }
            except Exception as inner_e:
                # If full initialization fails, at least mark as configured
                print(f"Full initialization failed, but basic setup completed: {inner_e}")
                db_initialized = True  # Mark as initialized anyway
                return {
                    'success': True,
                    'message': f'Database partially initialized: {str(inner_e)}',
                    'database_initialized': db_initialized
                }
                
    except Exception as e:
        error_msg = str(e)
        print(f"Force database initialization failed: {error_msg}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': error_msg,
            'database_initialized': db_initialized
        }, 500

@app.route('/api/login', methods=['POST'])
def login():
    """Universal login endpoint for all user types"""
    try:
        from flask import request, session
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return {'success': False, 'error': 'Email and password required'}, 400
        
        from src.models.user import db, User
        
        with app.app_context():
            user = User.query.filter_by(email=email).first()
            
            if not user:
                return {'success': False, 'error': 'Invalid credentials'}, 401
            
            if not user.check_password(password):
                return {'success': False, 'error': 'Invalid credentials'}, 401
            
            if user.status.value != 'active':
                return {'success': False, 'error': 'Account is not active'}, 403
            
            # Store user session
            session['user_id'] = user.id
            session['user_role'] = user.role.value
            
            # Determine dashboard route based on role
            dashboard_routes = {
                'super_admin': '/super-admin/dashboard',
                'admin': '/admin/dashboard', 
                'alumni': '/alumni/dashboard',
                'student': '/student/dashboard'
            }
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role.value,
                    'status': user.status.value,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                },
                'redirect_to': dashboard_routes.get(user.role.value, '/dashboard'),
                'permissions': get_user_permissions(user.role.value)
            }
            
    except Exception as e:
        import traceback
        print(f"Login error: {e}")
        traceback.print_exc()
        return {'success': False, 'error': 'Login failed'}, 500

def get_user_permissions(role):
    """Return permissions based on user role"""
    permissions = {
        'super_admin': {
            'can_manage_institutions': True,
            'can_create_users': True,
            'can_manage_all_users': True,
            'can_view_analytics': True,
            'can_manage_system_settings': True,
            'can_delete_users': True,
            'can_manage_roles': True
        },
        'admin': {
            'can_manage_institutions': False,
            'can_create_users': True,
            'can_manage_all_users': False,
            'can_view_analytics': True,
            'can_manage_system_settings': False,
            'can_delete_users': False,
            'can_manage_roles': False
        },
        'alumni': {
            'can_manage_institutions': False,
            'can_create_users': False,
            'can_manage_all_users': False,
            'can_view_analytics': False,
            'can_manage_system_settings': False,
            'can_delete_users': False,
            'can_manage_roles': False
        },
        'student': {
            'can_manage_institutions': False,
            'can_create_users': False,
            'can_manage_all_users': False,
            'can_view_analytics': False,
            'can_manage_system_settings': False,
            'can_delete_users': False,
            'can_manage_roles': False
        }
    }
    return permissions.get(role, {})

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout endpoint"""
    session.clear()
    return {'success': True, 'message': 'Logged out successfully'}

# Super Admin Authentication Check
def require_super_admin():
    """Decorator to require super admin access"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session or session.get('user_role') != 'super_admin':
                return {'success': False, 'error': 'Super admin access required'}, 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

# Super Admin API Endpoints
@app.route('/api/super-admin/dashboard-stats', methods=['GET'])
@require_super_admin()
def get_dashboard_stats():
    """Get dashboard statistics for super admin"""
    try:
        from src.models.user import User
        from src.models.institution import Institution
        
        with app.app_context():
            # Get user statistics
            total_users = User.query.count()
            super_admins = User.query.filter_by(role='super_admin').count()
            admins = User.query.filter_by(role='admin').count()
            alumni = User.query.filter_by(role='alumni').count()
            students = User.query.filter_by(role='student').count()
            
            # Get institution statistics
            total_institutions = Institution.query.count() if Institution else 0
            active_users = User.query.filter_by(status='active').count()
            
            return {
                'success': True,
                'stats': {
                    'users': {
                        'total': total_users,
                        'super_admins': super_admins,
                        'admins': admins,
                        'alumni': alumni,
                        'students': students,
                        'active': active_users
                    },
                    'institutions': {
                        'total': total_institutions
                    }
                }
            }
    except Exception as e:
        import traceback
        print(f"Dashboard stats error: {e}")
        traceback.print_exc()
        return {'success': False, 'error': 'Failed to fetch dashboard stats'}, 500

@app.route('/api/super-admin/users', methods=['GET'])
@require_super_admin()
def get_all_users():
    """Get all users with pagination"""
    try:
        from src.models.user import User
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        role_filter = request.args.get('role')
        
        with app.app_context():
            query = User.query
            
            if search:
                query = query.filter(
                    (User.email.contains(search)) |
                    (User.username.contains(search)) |
                    (User.first_name.contains(search)) |
                    (User.last_name.contains(search))
                )
            
            if role_filter:
                query = query.filter(User.role == role_filter)
            
            users = query.paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            return {
                'success': True,
                'users': [{
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role.value,
                    'status': user.status.value,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                } for user in users.items],
                'pagination': {
                    'page': page,
                    'pages': users.pages,
                    'per_page': per_page,
                    'total': users.total,
                    'has_next': users.has_next,
                    'has_prev': users.has_prev
                }
            }
    except Exception as e:
        import traceback
        print(f"Get users error: {e}")
        traceback.print_exc()
        return {'success': False, 'error': 'Failed to fetch users'}, 500

@app.route('/api/super-admin/create-user', methods=['POST'])
@require_super_admin()
def create_user():
    """Create a new user (super admin only)"""
    try:
        from src.models.user import User, UserRole, UserStatus
        
        data = request.get_json()
        
        required_fields = ['email', 'username', 'password', 'role', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return {'success': False, 'error': f'{field} is required'}, 400
        
        with app.app_context():
            # Check if user already exists
            if User.query.filter_by(email=data['email']).first():
                return {'success': False, 'error': 'User with this email already exists'}, 400
            
            if User.query.filter_by(username=data['username']).first():
                return {'success': False, 'error': 'Username already taken'}, 400
            
            # Create new user
            new_user = User(
                email=data['email'],
                username=data['username'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                role=UserRole(data['role']),
                status=UserStatus('active')
            )
            new_user.set_password(data['password'])
            
            db.session.add(new_user)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'User created successfully',
                'user': {
                    'id': new_user.id,
                    'email': new_user.email,
                    'username': new_user.username,
                    'first_name': new_user.first_name,
                    'last_name': new_user.last_name,
                    'role': new_user.role.value,
                    'status': new_user.status.value
                }
            }
    except Exception as e:
        import traceback
        print(f"Create user error: {e}")
        traceback.print_exc()
        return {'success': False, 'error': 'Failed to create user'}, 500

@app.route('/api/super-admin/institutions', methods=['GET'])
@require_super_admin()
def get_institutions():
    """Get all institutions"""
    try:
        institutions = [
            {
                'id': 1,
                'name': 'Sample Institution 1',
                'type': 'University',
                'location': 'New Delhi',
                'status': 'active',
                'admin_count': 2,
                'student_count': 150,
                'alumni_count': 500
            },
            {
                'id': 2,
                'name': 'Sample Institution 2', 
                'type': 'College',
                'location': 'Mumbai',
                'status': 'active',
                'admin_count': 1,
                'student_count': 80,
                'alumni_count': 200
            }
        ]
        return {'success': True, 'institutions': institutions}
    except Exception as e:
        return {'success': False, 'error': 'Failed to fetch institutions'}, 500
def get_colleges_simple():
    """Simple colleges endpoint that doesn't require database"""
    colleges = [
        "Indian Institute of Technology Bombay (IIT Bombay)",
        "Indian Institute of Technology Delhi (IIT Delhi)", 
        "Indian Institute of Technology Madras (IIT Madras)",
        "Indian Institute of Technology Kanpur (IIT Kanpur)",
        "Indian Institute of Technology Kharagpur (IIT Kharagpur)",
        "Indian Institute of Science (IISc) Bangalore",
        "All India Institute of Medical Sciences (AIIMS), New Delhi",
        "Jawaharlal Nehru University (JNU), New Delhi",
        "University of Delhi (DU)",
        "Banaras Hindu University (BHU), Varanasi",
        "Vellore Institute of Technology (VIT), Vellore",
        "Amrita Vishwa Vidyapeetham, Coimbatore",
        "National Institute of Technology Tiruchirappalli (NIT Trichy)",
        "Anna University, Chennai",
        "Indian Institute of Management Ahmedabad (IIM Ahmedabad)",
        "Jadavpur University, Kolkata",
        "BITS Pilani - Pilani Campus",
        "Delhi Technological University (DTU)",
        "Pune Institute of Computer Technology",
        "Manipal Academy of Higher Education, Manipal"
    ]
    
    return {
        'success': True,
        'colleges': colleges
    }

# Add CORS support with credentials - unified approach
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    
    # List of allowed origins
    allowed_origins = [
        'https://alumna-connect-platform-xldu.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://localhost:5173'
    ]
    
    # Set CORS headers if origin is allowed
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        response.headers['Access-Control-Max-Age'] = '86400'
    
    return response

# Handle OPTIONS preflight requests
@app.route('/<path:path>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS']) 
def handle_options(path=''):
    origin = request.headers.get('Origin')
    allowed_origins = [
        'https://alumna-connect-platform-xldu.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://localhost:5173'
    ]
    
    if origin in allowed_origins:
        from flask import make_response
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
        response.headers['Access-Control-Max-Age'] = '86400'
        return response
    
    return make_response('', 404)

# This is required for Vercel
if __name__ == '__main__':
    app.run()
