// Multibranch: dev → build frontend:staging + deploy only frontend-staging
// main → build frontend:production + deploy only frontend-production
// Use distinct compose -p names so staging vs production are separate projects;
// otherwise --remove-orphans on one file removes the other env's frontend container.
// Prunes dangling images, stopped containers, and build cache after build/deploy.
pipeline {
    agent any
    stages {
        stage('Build image (staging)') {
            when {
                branch 'dev'
            }
            steps {
                withCredentials([string(credentialsId: 'SKYCARE_VITE_GOOGLE_MAPS_API_KEY', variable: 'VITE_GOOGLE_MAP_API_KEY')]) {
                    sh '''
                        docker build -f Dockerfile.frontend -t frontend:staging \
                            --build-arg VITE_BACKEND_BASE_URL=https://stg.skycare.au/api \
                            --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                            --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                            --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                            --build-arg VITE_APPLICATION_CLIENT=client.skyCarePortal \
                            --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download \
                            --build-arg VITE_GOOGLE_MAP_API_KEY="$VITE_GOOGLE_MAP_API_KEY" .
                        docker image prune -f
                        docker builder prune -f
                    '''
                }
            }
        }
        stage('Deploy frontend (staging)') {
            when {
                branch 'dev'
            }
            steps {
                sh '''
                    docker compose -p skycare-frontend-staging -f deploy/docker-compose.frontend-staging.yml up -d --force-recreate --remove-orphans
                    docker image prune -f
                    docker container prune -f
                    docker builder prune -f
                '''
            }
        }
        stage('Build image (production)') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([string(credentialsId: 'SKYCARE_VITE_GOOGLE_MAPS_API_KEY', variable: 'VITE_GOOGLE_MAP_API_KEY')]) {
                    sh '''
                        docker build -f Dockerfile.frontend -t frontend:production \
                            --build-arg VITE_BACKEND_BASE_URL=https://skycare.au/api \
                            --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                            --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                            --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                            --build-arg VITE_APPLICATION_CLIENT=client.skyCarePortal \
                            --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download \
                            --build-arg VITE_GOOGLE_MAP_API_KEY="$VITE_GOOGLE_MAP_API_KEY" .
                        docker image prune -f
                        docker builder prune -f
                    '''
                }
            }
        }
        stage('Deploy frontend (production)') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    docker compose -p skycare-frontend-production -f deploy/docker-compose.frontend-production.yml up -d --force-recreate --remove-orphans
                    docker image prune -f
                    docker container prune -f
                    docker builder prune -f
                '''
            }
        }
    }
    post {
        success {
            echo 'Frontend build and deploy finished.'
        }
        failure {
            echo 'Frontend pipeline failed.'
        }
    }
}
