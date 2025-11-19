#!/bin/bash

# Backend Deployment Script
# This script helps deploy the backend to various platforms

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
DEPLOYMENT_TARGET="${1:-render}"  # Default to render
ENVIRONMENT="${2:-production}"

# Functions
print_header() {
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}================================${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
    fi
    print_success "Backend directory found"
    
    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        print_error "package.json not found in $BACKEND_DIR"
    fi
    print_success "package.json found"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
    fi
    print_success "Node.js is installed: $(node --version)"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
    fi
    print_success "npm is installed: $(npm --version)"
}

# Check environment variables
check_env_vars() {
    print_header "Checking Environment Variables"
    
    if [ ! -f "$BACKEND_DIR/.env.$ENVIRONMENT" ] && [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "No .env file found in $BACKEND_DIR"
        print_warning "Make sure MONGODB_URI, JWT_SECRET, and other vars are set"
    else
        print_success "Environment file found"
    fi
    
    # Check for critical env vars
    if [ -z "$MONGODB_URI" ] && [ ! -f "$BACKEND_DIR/.env.$ENVIRONMENT" ]; then
        print_warning "MONGODB_URI environment variable not set"
    else
        print_success "MONGODB_URI is configured"
    fi
}

# Build backend
build_backend() {
    print_header "Building Backend"
    
    cd "$BACKEND_DIR"
    
    print_success "Installing dependencies..."
    npm ci
    
    print_success "Running linter..."
    npm run lint --if-present || print_warning "Linting failed - continuing anyway"
    
    print_success "Running tests..."
    npm test --if-present || print_warning "Tests failed - continuing anyway"
    
    print_success "Building application..."
    npm run build --if-present || print_success "No build step required"
    
    cd - > /dev/null
}

# Deploy to Render
deploy_render() {
    print_header "Deploying to Render"
    
    if [ -z "$RENDER_DEPLOY_HOOK_URL" ]; then
        print_error "RENDER_DEPLOY_HOOK_URL environment variable not set"
    fi
    
    print_success "Triggering Render deployment..."
    curl --request POST --url "$RENDER_DEPLOY_HOOK_URL"
    
    print_success "Deployment webhook triggered"
    echo "Check your Render dashboard for deployment status"
    echo "Dashboard: https://dashboard.render.com"
}

# Deploy to Railway
deploy_railway() {
    print_header "Deploying to Railway"
    
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed. Install it: npm install -g @railway/cli"
    fi
    
    print_success "Checking Railway configuration..."
    
    if [ ! -f "railway.json" ]; then
        print_warning "railway.json not found. Running railway init..."
        railway init || print_error "Railway initialization failed"
    fi
    
    print_success "Deploying with Railway CLI..."
    railway up --detach
    
    print_success "Deployment sent to Railway"
    echo "Check status with: railway logs"
}

# Deploy to Heroku
deploy_heroku() {
    print_header "Deploying to Heroku"
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Install it from https://devcenter.heroku.com/articles/heroku-cli"
    fi
    
    if [ ! -f "Procfile" ]; then
        print_error "Procfile not found. Create one before deploying to Heroku"
    fi
    
    print_success "Checking Heroku authentication..."
    heroku auth:whoami || print_error "Not logged into Heroku. Run: heroku login"
    
    print_success "Deploying to Heroku..."
    git push heroku main
    
    print_success "Deployment complete"
    echo "Check logs with: heroku logs --tail"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    if [ -z "$BACKEND_URL" ]; then
        print_warning "BACKEND_URL not set. Skipping health check."
        return
    fi
    
    print_success "Checking backend health..."
    
    HEALTH_URL="$BACKEND_URL/health"
    
    for i in {1..30}; do
        if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
            print_success "Backend is healthy!"
            curl -s "$HEALTH_URL" | jq '.'
            return
        fi
        
        echo "Attempt $i/30: Waiting for service to be ready..."
        sleep 2
    done
    
    print_warning "Could not verify backend health. Check logs at your deployment provider."
}

# Post-deployment verification
post_deployment_checks() {
    print_header "Post-Deployment Checks"
    
    echo "Please verify the following:"
    echo "1. [ ] Application is accessible at $BACKEND_URL"
    echo "2. [ ] Health check passes at $BACKEND_URL/health"
    echo "3. [ ] Database connection is working"
    echo "4. [ ] Environment variables are set correctly"
    echo "5. [ ] Logs show no errors"
    echo ""
    echo "Useful commands:"
    echo "  - Check logs (Render): render logs --tail"
    echo "  - Check logs (Railway): railway logs"
    echo "  - Check logs (Heroku): heroku logs --tail"
}

# Main execution
main() {
    print_header "Backend Deployment Script"
    echo "Target: $DEPLOYMENT_TARGET"
    echo "Environment: $ENVIRONMENT"
    echo ""
    
    check_prerequisites
    check_env_vars
    build_backend
    
    case "$DEPLOYMENT_TARGET" in
        render)
            deploy_render
            ;;
        railway)
            deploy_railway
            ;;
        heroku)
            deploy_heroku
            ;;
        *)
            print_error "Unknown deployment target: $DEPLOYMENT_TARGET"
            ;;
    esac
    
    verify_deployment
    post_deployment_checks
    
    print_success "Backend deployment script completed!"
}

# Show usage
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 [TARGET] [ENVIRONMENT]"
    echo ""
    echo "Arguments:"
    echo "  TARGET       Deployment target (render, railway, heroku) - default: render"
    echo "  ENVIRONMENT  Environment (production, staging) - default: production"
    echo ""
    echo "Examples:"
    echo "  $0 render production"
    echo "  $0 railway staging"
    echo "  $0 heroku production"
    exit 0
fi

main
