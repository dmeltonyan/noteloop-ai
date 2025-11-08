#!/bin/bash

echo "========================================"
echo "  NoteLoop AI Backend Server Starter"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    exit 1
fi

echo "Python version:"
python3 --version
echo ""

echo "Installing/updating dependencies..."
pip3 install -r requirements.txt --quiet

echo ""
echo "Starting server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

python3 run.py


