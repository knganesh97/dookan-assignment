from app import create_app

app = create_app()

if __name__ == '__main__':
    ssl_context = None
    if app.config.get('SSL_ENABLED'):
        ssl_context = (app.config['SSL_CERT_PATH'], app.config['SSL_KEY_PATH'])
    
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=ssl_context) 