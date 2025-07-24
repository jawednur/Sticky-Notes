#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the parent directory (where package.json is located)
cd "$SCRIPT_DIR/.."

# Set up PATH to include common npm locations
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Configuration
CONNECTION_CHECK_INTERVAL=5  # Check for connections every 5 seconds
NO_CONNECTION_TIMEOUT=10     # Shutdown after 10 seconds with no connections
INITIAL_GRACE_PERIOD=60      # Give 60 seconds for initial connection

# Function to find npm
find_npm() {
    for path in "/usr/local/bin/npm" "/opt/homebrew/bin/npm" "$(which npm 2>/dev/null)"; do
        if [ -x "$path" ]; then
            echo "$path"
            return 0
        fi
    done
    return 1
}

# Find npm executable
NPM_PATH=$(find_npm)
if [ -z "$NPM_PATH" ]; then
    echo "Error: npm not found. Please install Node.js"
    exit 1
fi

# Function to check if server is running
check_server() {
    curl -s http://localhost:5173 > /dev/null 2>&1
    return $?
}

# Function to wait for server to start
wait_for_server() {
    echo "Waiting for server to start..."
    for i in {1..30}; do
        if check_server; then
            echo "Server is ready!"
            return 0
        fi
        sleep 1
    done
    echo "Server failed to start within 30 seconds"
    return 1
}

# Function to count active connections to the server
count_connections() {
    # Count established connections to port 5173
    # This works on macOS with netstat
    netstat -an | grep -E "\.5173.*ESTABLISHED" | grep -v "127.0.0.1.5173.*127.0.0.1" | wc -l | tr -d ' '
}

# Function to check if any browser process has connections to our server
has_browser_connections() {
    local count=$(count_connections)
    if [ "$count" -gt 0 ]; then
        return 0  # Has connections
    else
        return 1  # No connections
    fi
}

# Cleanup function
cleanup() {
    echo -e "\nShutting down server..."
    if [ ! -z "$DEV_PID" ] && kill -0 $DEV_PID 2>/dev/null; then
        kill $DEV_PID 2>/dev/null
        wait $DEV_PID 2>/dev/null
    fi
    echo "Sticky Notes application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    "$NPM_PATH" install
fi

# Check if server is already running
if check_server; then
    echo "Server is already running, opening browser..."
    open http://localhost:5173
    echo "Note: This script cannot monitor an already-running server."
    echo "To enable automatic shutdown when tabs close, please stop the existing server and run this script again."
else
    # Start the development server
    echo "Starting Sticky Notes application..."
    "$NPM_PATH" run dev &
    DEV_PID=$!
    
    # Wait for the server to be ready
    if wait_for_server; then
        # Open the application in the default browser
        open http://localhost:5173
        echo "Sticky Notes application opened in browser"
        echo "Server running on http://localhost:5173"
        echo "Server will auto-shutdown when all browser tabs are closed"
        echo "Press Ctrl+C to stop the server manually"
        
        # Give some time for the browser to establish connection
        echo "Waiting for browser connection..."
        STARTUP_TIME=$(date +%s)
        CONNECTION_ESTABLISHED=false
        
        # Wait for initial connection (up to INITIAL_GRACE_PERIOD seconds)
        while [ $(($(date +%s) - STARTUP_TIME)) -lt $INITIAL_GRACE_PERIOD ]; do
            if has_browser_connections; then
                CONNECTION_ESTABLISHED=true
                echo "Browser connected!"
                break
            fi
            sleep 1
        done
        
        if [ "$CONNECTION_ESTABLISHED" = false ]; then
            echo "Warning: No browser connection detected after $INITIAL_GRACE_PERIOD seconds"
            echo "The server will continue running. Open http://localhost:5173 in your browser."
        fi
        
        # Monitor for connections
        NO_CONNECTION_TIME=0
        HAD_CONNECTION=$CONNECTION_ESTABLISHED
        
        while kill -0 $DEV_PID 2>/dev/null; do
            sleep $CONNECTION_CHECK_INTERVAL
            
            if has_browser_connections; then
                # We have active connections
                NO_CONNECTION_TIME=0
                if [ "$HAD_CONNECTION" = false ]; then
                    echo "Browser connection detected!"
                    HAD_CONNECTION=true
                fi
            else
                # No active connections
                if [ "$HAD_CONNECTION" = true ]; then
                    # We had a connection before, start countdown
                    NO_CONNECTION_TIME=$((NO_CONNECTION_TIME + CONNECTION_CHECK_INTERVAL))
                    
                    if [ $NO_CONNECTION_TIME -ge $NO_CONNECTION_TIMEOUT ]; then
                        echo "All browser tabs closed. Shutting down server..."
                        cleanup
                    fi
                fi
            fi
        done
    else
        echo "Failed to start the server"
        kill $DEV_PID 2>/dev/null
        exit 1
    fi
fi

echo "Sticky Notes application stopped"