#!/bin/bash

echo "🚀 Starting Furnish & Co. Full Stack Application..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    mkdir -p data/db data/log
    mongod --dbpath data/db --fork --logpath data/log/mongod.log
    sleep 2
fi

# Start Backend
echo "🔧 Starting Backend Server..."
cd server
npm run dev &
BACKEND_PID=$!
sleep 3

# Start Frontend
echo "🎨 Starting Frontend..."
cd ..
PORT=3001 npm start &
FRONTEND_PID=$!

echo "✅ Application Started Successfully!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔌 Backend API: http://localhost:5001"
echo "⚙️  Admin Panel: http://localhost:3001/admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping all services..."; kill $BACKEND_PID $FRONTEND_PID; pkill mongod; exit' INT
wait
