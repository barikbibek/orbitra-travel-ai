## EC2 Deployment

### 1. Server setup
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker ubuntu

### 2. Clone & configure
git clone https://github.com/barikbibek/orbitra-travel-ai.git
cd orbitra-travel-ai/server
cp .env.example .env
nano .env   # fill in all values

### 3. Run
docker-compose up -d --build

### 4. Nginx reverse proxy (port 80 → 5000)
sudo apt install nginx -y

# /etc/nginx/sites-available/travel-ai
server {
    listen 80;
    server_name your-ec2-ip-or-domain;

    location /api {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

### 5. Check logs
docker-compose logs -f server