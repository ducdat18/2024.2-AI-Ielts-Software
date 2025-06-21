# IELTS Database Setup with Docker Compose

How to set up and run the PostgreSQL database for IELTS using Docker Compose.

## Prerequisites
- Docker installed on your system
- Docker Compose installed
## How to set up the database

1. **Download this folder**

2. **Verify file structure and redirect to the database folder**:
- Redirect to the database folder
```
cd aims_db
```
3. **Run the database**:
```
docker-compose up -d
```
4. **Verify the database is running**:
```
docker-compose ps
```
5. **Check the log**:
```
docker-compose logs
```
6. **Connect to the database**:
```
docker exec -it ielts_db psql -U ielts_admin -d ielts
```
**Additional: Remove the database**
```
docker-compose down -v
```
## Data will be loaded into the database later