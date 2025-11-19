#!/bin/bash

# Frontend Deployment Script
# This script helps deploy the frontend to various platforms

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
DEPLOYMENT_TARGET="${1:-vercel}"  # Default to vercel
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
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
    fi
    print_success "Frontend directory found"
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        print_error "package.json not found in $FRONTEND_DIR"
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
    
    if [ ! -f "$FRONTEND_DIR/.env.$ENVIRONMENT" ] && [ ! -f "$FRONTEND_DIR/.env" ]; then
        print_warning "No .env file found in $FRONTEND_DIR"
        print_warning "Make sure API_BASE_URL is set correctly"
    else
        print_success "Environment file found"
    fi
    
    # Check for API base URL
    if [ -z "$VITE_API_BASE_URL" ] && [ -z "$REACT_APP_API_BASE_URL" ]; then
        print_warning "API_BASE_URL environment variable not set"
    else
        print_success "API_BASE_URL is configured"
    fi
}

# Build frontend
build_frontend() {
    print_header "Building Frontend"
    
    cd "$FRONTEND_DIR"
    
    print_success "Installing dependencies..."
    npm ci
    
    print_success "Running linter..."
    npm run lint --if-present || print_warning "Linting failed - continuing anyway"
    
    print_success "Running tests..."
    npm test -- --watchAll=false --passWithNoTests || print_warning "Tests failed - continuing anyway"
    
    print_success "Building application..."
    npm run build
    
    if [ -d "dist" ]; then
        BUILD_OUTPUT="dist"
        print_success "Build output: dist/"
    elif [ -d "build" ]; then
        BUILD_OUTPUT="build"
        print_success "Build output: build/"
    else
        print_error "No build output found (expected dist/ or build/)"
    fi
    
    cd - > /dev/null
}

# Deploy to Vercel
deploy_vercel() {
    print_header "Deploying to Vercel"
    
    if [ -z "$VERCEL_TOKEN" ]; then
        print_error "VERCEL_TOKEN environment variable not set"
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_success "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_success "Deploying to Vercel..."
    vercel deploy --prod --token "$VERCEL_TOKEN"
    
    print_success "Deployment complete"
}

# Deploy to Netlify
deploy_netlify() {
    print_header "Deploying to Netlify"
    
    if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
        print_error "NETLIFY_AUTH_TOKEN environment variable not set"
    fi
    
    if [ -z "$NETLIFY_SITE_ID" ]; then
        print_error "NETLIFY_SITE_ID environment variable not set"
    fi
    
    if ! command -v netlify &> /dev/null; then
        print_success "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    BUILD_DIR="$FRONTEND_DIR/$BUILD_OUTPUT"
    
    print_success "Deploying to Netlify..."
    netlify deploy --prod --dir "$BUILD_DIR" --auth "$NETLIFY_AUTH_TOKEN" --site "$NETLIFY_SITE_ID"
    
    print_success "Deployment complete"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_header "Deploying to GitHub Pages"
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN environment variable not set"
    fi
    
    if [ ! -d ".git" ]; then
        print_error "Not a git repository. Initialize git first."
    fi
    
    print_success "Building for GitHub Pages..."
    
    # GitHub Pages deployment script
    cd "$FRONTEND_DIR"
    
    # Determine build output
    if [ -d "dist" ]; then
        BUILD_DIR="dist"
    elif [ -d "build" ]; then
        BUILD_DIR="build"
    else
        print_error "No build output found"
    fi
    
    cd - > /dev/null
    
    # Create gh-pages branch and deploy
    print_success "Deploying to gh-pages branch..."
    
    # Install gh-pages if not present
    if ! npm list -g gh-pages &> /dev/null; then
        npm install -g gh-pages
    fi
    
    cd "$FRONTEND_DIR"
    npx gh-pages -d "$BUILD_DIR"
    cd - > /dev/null
    
    print_success "Deployment complete"
    echo "Your site will be available at: https://<username>.github.io/<repo-name>"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    if [ -z "$FRONTEND_URL" ]; then
        print_warning "FRONTEND_URL not set. Skipping verification."
        return
    fi
    
    print_success "Checking frontend accessibility..."
    
    for i in {1..30}; do
        if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
            print_success "Frontend is accessible!"
            return
        fi
        
        echo "Attempt $i/30: Waiting for site to be ready..."
        sleep 2
    done
    
    print_warning "Could not verify frontend. Check logs at your deployment provider."
}

# Post-deployment verification
post_deployment_checks() {
    print_header "Post-Deployment Checks"
    
    echo "Please verify the following:"
    echo "1. [ ] Application is accessible at $FRONTEND_URL"
    echo "2. [ ] No console errors in browser DevTools"
    echo "3. [ ] API calls are working correctly"
    echo "4. [ ] Environment variables are loaded correctly"
    echo "5. [ ] Static assets are loading (CSS, images, etc.)"
    echo ""
    echo "Deployment Provider Dashboards:"
    case "$DEPLOYMENT_TARGET" in
        vercel)
            echo "  - Vercel: https://vercel.com/dashboard"
            ;;
        netlify)
            echo "  - Netlify: https://app.netlify.com"
            ;;
        github)
            echo "  - GitHub Pages: https://github.com/<user>/<repo>/settings/pages"
            ;;
    esac
}

# Main execution
main() {
    print_header "Frontend Deployment Script"
    echo "Target: $DEPLOYMENT_TARGET"
    echo "Environment: $ENVIRONMENT"
    echo ""
    
    check_prerequisites
    check_env_vars
    build_frontend
    
    case "$DEPLOYMENT_TARGET" in
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        github|github-pages)
            deploy_github_pages
            ;;
        *)
            print_error "Unknown deployment target: $DEPLOYMENT_TARGET"
            ;;
    esac
    
    verify_deployment
    post_deployment_checks
    
    print_success "Frontend deployment script completed!"
}

# Show usage
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 [TARGET] [ENVIRONMENT]"
    echo ""
    echo "Arguments:"
    echo "  TARGET       Deployment target (vercel, netlify, github-pages) - default: vercel"
    echo "  ENVIRONMENT  Environment (production, staging) - default: production"
    echo ""
    echo "Examples:"
    echo "  $0 vercel production"
    echo "  $0 netlify staging"
    echo "  $0 github-pages production"
    exit 0
fi

main
