mport os

# 1. Fetch Render's Redis link. Falls back to localhost if running on your machine.
base_redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379').rstrip('/')

# 2. Update your 3 configuration variables dynamically
broker_url = f"{base_redis_url}/0"
result_backend = f"{base_redis_url}/1"
timezone = "Asia/Kolkata"
