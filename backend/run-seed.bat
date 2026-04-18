@echo off
cd /d "%~dp0"
set MONGO_URI=mongodb+srv://sidharthakalva_db_user:busapp29@cluster0.pq7acfs.mongodb.net/drivex?retryWrites=true^&w=majority^&appName=Cluster0
set JWT_SECRET=drivex_super_secret_key_2024
npm run seed
pause
