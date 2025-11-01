# TODO: Package React and Flask in Docker with Nginx Proxy

- [x] Create `start.sh` script to run Flask in background and start Nginx
- [x] Update `nginx.conf` to proxy API requests to Flask on localhost:5000
- [x] Update `Dockerfile` for multi-stage build: React build, then Python+Nginx stage
- [ ] Build Docker image and test functionality
