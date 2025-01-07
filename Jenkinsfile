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
                dir('frontend-prod') {
                    script {
                        sh """
                            docker build -f Dockerfile.proxy -t ${PROXY_IMAGE} .
                        """
                    }
                }
            }
        }
        stage('Build and Deploy for Staging') {
            when {
                branch 'dev'
            }
            stages {
                stage('Build Staging Frontend') {
                    steps {
                        dir('frontend-stg') {
                            script {
                                sh """
                                docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE} \
                                    --build-arg VITE_BACKEND_BASE_URL=https://stg.skycare.au/api \
                                    --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                                    --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download .
                                """
                            }
                        }
                    }
                }
                stage('Build Staging Backend') {
                    steps {
                        dir('backend-stg') {
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
                stage('Remove Old Staging Containers') {
                    steps {
                        script {
                            def containers = ['frontend-staging', 'database-staging', 'backend-staging', 'reverse-proxy']
                            containers.each { container ->
                                sh """
                                docker ps -a -q --filter "name=${container}" | xargs -r docker stop
                                docker ps -a -q --filter "name=${container}" | xargs -r docker rm -f
                                """
                            }
                        }
                    }
                }
                stage('Deploy to Staging') {
                    steps {
                        dir('backend-stg') {
                            script {
                                sh 'docker-compose -f docker-compose.dev.yml up -d'
                            }
                        }
                    }
                }
            }
        }
        stage('Build and Deploy for Production') {
            when {
                branch 'main'
            }
            stages {
                stage('Build Production Frontend') {
                    steps {
                        dir('frontend-prod') {
                            script {
                                sh """
                                docker build -f Dockerfile.frontend -t ${FRONTEND_IMAGE} \
                                    --build-arg VITE_BACKEND_BASE_URL=https://skycare.au/api \
                                    --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                                    --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download .
                                """
                            }
                        }
                    }
                }
                stage('Build Production Backend') {
                    steps {
                        dir('backend-prod') {
                            script {
                                sh """
                                docker build -t ${BACKEND_IMAGE} \
                                    --build-arg SPRING_PROFILES_ACTIVE=prod \
                                    --build-arg SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/skycareportal_prod \
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
                stage('Remove Old Production Containers') {
                    steps {
                        script {
                            def containers = ['frontend-production', 'database-production', 'backend-production', 'reverse-proxy']
                            containers.each { container ->
                                sh """
                                docker ps -a -q --filter "name=${container}" | xargs -r docker stop
                                docker ps -a -q --filter "name=${container}" | xargs -r docker rm -f
                                """
                            }
                        }
                    }
                }
                stage('Deploy to Production') {
                    steps {
                        dir('backend-prod') {
                            script {
                                sh 'docker-compose -f docker-compose.prod.yml up -d'
                            }
                        }
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
