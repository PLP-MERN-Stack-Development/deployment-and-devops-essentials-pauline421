# Week 7 — Deployment & DevOps Essentials

Summary
- Implement and document deployment and basic DevOps practices for the project.
- Deliverables: containerized application, CI pipeline, deployment instructions, short reflection.

Learning objectives
- Containerize the application with Docker.
- Create an automated CI workflow (lint, test, build).
- Deploy a build artifact to a simple environment (local Docker, or demo cloud/container registry).
- Document setup, run, and troubleshooting steps.

Required repository contents
- Dockerfile that builds the app image.
- docker-compose.yml (optional) to run app + dependencies.
- .github/workflows/ci.yml (GitHub Actions) that runs tests and builds image.
- README.md (this file) with usage and submission instructions.
- A short reflection: WEEK7_REFLECTION.md (1–2 paragraphs describing choices and issues).

Prerequisites
- Docker >= 20.x
- Git
- (Optional) Node.js / Python / Java runtime used by the app
- GitHub account for CI (if pushing to GitHub Container Registry)

Quick setup & local run
1. Build image
  - docker build -t myapp:week7 .
2. Run container
  - docker run --rm -p 8080:8080 myapp:week7
3. (If using docker-compose)
  - docker-compose up --build

Tests
- Run unit tests locally using the project’s test command, for example:
  - npm test
  - pytest
  - mvn test
- CI should run these tests automatically. Ensure the test exit code indicates success.

CI/CD (GitHub Actions)
- Create .github/workflows/ci.yml to:
  - Checkout code
  - Set up runtime (node/python/java)
  - Install dependencies
  - Run linter and tests
  - Build Docker image
  - Optionally push image to registry on success
- Keep secrets (registry credentials) in GitHub Settings → Secrets.

Deployment notes
- For a simple demo: run the Docker image on a VM or local machine and map ports.
- For cloud deployment: push image to a registry (Docker Hub / GHCR) and deploy to a service (Cloud Run, ECS, AKS, or a VM).
- Provide exact commands used for push and deploy in WEEK7_REFLECTION.md.

Submission checklist
- [ ] Dockerfile present and builds successfully
- [ ] CI workflow runs and passes on main branch
- [ ] README.md (this) updated with run instructions
- [ ] WEEK7_REFLECTION.md added
- [ ] Any required manifests (docker-compose, k8s) included if used

Grading criteria (informal)
- Correctness: container builds and runs (40%)
- Automation: CI runs tests and builds (30%)
- Documentation: clear README and reflection (20%)
- Bonus: deployment to a cloud service / Kubernetes manifest (10%)

Troubleshooting tips
- Build fails: check base image and build context; run docker build with --progress=plain for more logs.
- Port conflicts: ensure host port free or change mapping.
- CI fails: inspect action logs for missing secrets or runtime mismatch.

Helpful resources
- Docker docs: https://docs.docker.com
- GitHub Actions: https://docs.github.com/actions
- Docker best practices: Dockerfile linting and multi-stage builds

