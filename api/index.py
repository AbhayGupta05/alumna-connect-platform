from flask import Flask, jsonify
import os
import sys

# Add path for imports
sys.path.insert(0, os.path.dirname(__file__))

# Create Flask app
app = Flask(__name__)

# Track if main app was loaded
main_app_loaded = False
import_error_msg = "No error"

# Try to import the main application routes
try:
    from app import app as main_app
    # If successful, use the main app
    app = main_app
    main_app_loaded = True
    print("✅ Successfully loaded main Flask app")
except Exception as e:
    import_error_msg = str(e)
    print(f"❌ Could not import main app: {e}")
    
    # Use fallback routes with more comprehensive endpoints
    @app.route('/')
    def home():
        return jsonify({
            'status': 'ok',
            'message': 'Alumni Management Platform API',
            'version': '1.0.0',
            'main_app_loaded': main_app_loaded,
            'import_error': import_error_msg,
            'endpoints': {
                'health': '/health',
                'test': '/test',
                'auth': '/auth/*',
                'api': '/api/*',
                'alumni-claim': '/alumni-claim/*'
            }
        })
    
    @app.route('/health')
    def health():
        return jsonify({
            'status': 'healthy', 
            'service': 'Alumni API',
            'main_app_loaded': main_app_loaded
        })
    
    @app.route('/test')
    def test():
        return jsonify({
            'message': 'Test endpoint is working!',
            'success': True,
            'main_app_loaded': main_app_loaded
        })

# Add basic CORS support
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Add a catch-all route for debugging
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({
        'error': 'Route not found',
        'requested_path': f'/{path}',
        'main_app_loaded': main_app_loaded,
        'available_endpoints': ['/', '/health', '/test']
    }), 404

# For local development
if __name__ == '__main__':
    app.run(debug=True)
