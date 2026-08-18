"""
GlycoGuard AI - WSGI Production Entry Point for Gunicorn / Cloud Deployment
"""

import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

if __name__ == "__main__":
    app.run()
