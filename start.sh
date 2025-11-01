#!/bin/sh

# Start Flask app in the background
cd /app/backend
python app.py &

# Wait a bit for Flask to start
sleep 2

# Start Nginx
nginx -g 'daemon off;'
