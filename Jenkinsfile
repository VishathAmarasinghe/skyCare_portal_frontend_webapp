pipeline {
    agent any
    environment {
        FRONTEND_REPO = 'https://github.com/VishathAmarasinghe/skyCare_portal_frontend_webapp.git'
        BACKEND_REPO  = 'https://github.com/VishathAmarasinghe/skyCarePortal_backend.git'
        FRONTEND_IMAGE = 'frontend:latest'
        BACKEND_IMAGE = 'backend:latest'
        PROXY_IMAGE = 'proxy:latest'
        REGISTRY = 'docker.io'
    }
    stages {
        stage('Checkout Repositories') {
            steps {
                script {
                    // Checkout both repositories
                    dir('frontend-prod') {
                        git url: "${FRONTEND_REPO}", branch: 'main', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                    dir('backend-prod') {
                        git url: "${BACKEND_REPO}", branch: 'main', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                    dir('frontend-stg') {
                        git url: "${FRONTEND_REPO}", branch: 'dev', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                    dir('backend-stg') {
                        git url: "${BACKEND_REPO}", branch: 'dev', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                }
            }
        }
        stage('Reverse Proxy Configuration') {
            steps {
                dir('frontend-prod') { // Ensure the directory is correct
                    script {
                        sh """
                            docker build -f Dockerfile.proxy -t ${PROXY_IMAGE} .
                        """
                    }
                }
            }
        }
        stage('Build and Deploy to Staging') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend-prod') {
                            script {
                                sh """
                                docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE} \
                                    --build-arg VITE_BACKEND_BASE_URL=http://backend:5000 \
                                    --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                                    --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download .
                                """
                            }
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        dir('backend-prod') {
                            script {
                                sh """
                                docker build -t ${BACKEND_IMAGE} \
                                    --build-arg SPRING_PROFILES_ACTIVE=dev \
                                    --build-arg SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/skycareportal_dev \
                                    --build-arg SPRING_DATASOURCE_USERNAME=root \
                                    --build-arg SPRING_DATASOURCE_PASSWORD=root \
                                    --build-arg SPRING_MAIL_USERNAME=projectvishath@gmail.com \
                                    --build-arg SPRING_MAIL_PASSWORD='ovdi uiox jqvd avai' \
                                    --build-arg FRONTEND_URL=http://frontend:80 \
                                    --build-arg SERVER_PORT=5000 .
                                """
                            }
                        }
                    }
                }
            }
        }
        stage('Deploy to Staging') {
            steps {
                dir('backend-prod') {
                    script {
                        sh 'docker-compose -f docker-compose.dev.yml up -d'
                        sh 'docker-compose -f docker-compose.proxy.yml up -d'
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'Build and deployment completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
