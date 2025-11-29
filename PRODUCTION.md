# Production Deployment Guide

## Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Environment variables configured

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Set Required Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3000
   SESSION_SECRET=<generate-strong-random-string>
   ADMIN_PASSWORD=<your-secure-password>
   ```

4. **Generate SESSION_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Start Server**
   ```bash
   npm start
   # or
   npm run production
   ```

## Production Checklist

### Security
- [x] SESSION_SECRET set and strong (32+ characters)
- [x] ADMIN_PASSWORD set and secure
- [x] NODE_ENV=production
- [x] HTTPS enabled (via reverse proxy)
- [x] Security headers configured
- [x] CSRF protection enabled
- [x] Rate limiting enabled
- [x] Input sanitization enabled

### Performance
- [x] Compression enabled
- [x] Caching enabled
- [x] Static file caching configured
- [x] File operation locking implemented

### Monitoring
- [x] Health check endpoint: `/health`
- [x] Error logging configured
- [x] Production error messages (no stack traces)

## Recommended Production Setup

### Using PM2 (Process Manager)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2**
   ```bash
   pm2 start server.js --name "mobi-menu" --env production
   ```

3. **Save PM2 Configuration**
   ```bash
   pm2 save
   pm2 startup
   ```

4. **PM2 Commands**
   ```bash
   pm2 status          # Check status
   pm2 logs            # View logs
   pm2 restart mobi-menu  # Restart
   pm2 stop mobi-menu     # Stop
   ```

### Using Nginx as Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

**Required:**
- `NODE_ENV=production`
- `SESSION_SECRET` - Strong random string (32+ chars)
- `ADMIN_PASSWORD` - Secure admin password

**Optional:**
- `PORT` - Server port (default: 3000)

### Health Check

Monitor server health:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "uptime": 12345,
  "environment": "production",
  "version": "2.0.0"
}
```

## Security Best Practices

1. **Never commit .env file** - Already in .gitignore
2. **Use strong passwords** - Minimum 16 characters
3. **Rotate SESSION_SECRET** - Periodically change
4. **Enable HTTPS** - Use SSL/TLS certificates
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Monitor logs** - Check for suspicious activity
7. **Backup data** - Regular backups of `data.json` and `settings.json`

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Kill process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### Permission Errors
- Ensure Node.js has read/write permissions for data files
- Check file ownership and permissions

### Memory Issues
- Monitor memory usage with PM2: `pm2 monit`
- Consider increasing Node.js memory limit if needed

## Backup Strategy

### Manual Backup
```bash
# Backup data files
cp data.json data.json.backup
cp settings.json settings.json.backup
```

### Automated Backup (Cron)
```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * cp /path/to/data.json /path/to/backups/data-$(date +\%Y\%m\%d).json
```

## Updates

1. **Backup current data**
2. **Pull latest code**
3. **Install dependencies**: `npm install`
4. **Restart server**: `pm2 restart mobi-menu`

## Support

For issues or questions, check:
- Health endpoint: `/health`
- Server logs: `pm2 logs` or console output
- Error messages in production are minimal for security

