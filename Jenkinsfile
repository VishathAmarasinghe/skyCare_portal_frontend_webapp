pipeline {
    agent any
    environment {
        FRONTEND_REPO = 'https://github.com/VishathAmarasinghe/skyCare_portal_frontend_webapp.git'
        BACKEND_REPO  = 'https://github.com/VishathAmarasinghe/skyCarePortal_backend.git'
        FRONTEND_IMAGE = 'frontend:latest'
        BACKEND_IMAGE = 'backend:latest'
        REGISTRY = 'docker.io' 
    }
    stages {
        stage('Checkout Repositories') {
            steps {
                script {
                    // Checkout both repositories
                    dir('frontend') {
                        git url: "${FRONTEND_REPO}", branch: 'main', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                    dir('backend') {
                        git url: "${BACKEND_REPO}", branch: 'main', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                    dir('frontend') {
                        git url: "${FRONTEND_REPO}", branch: 'dev' , credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                    dir('backend') {
                        git url: "${BACKEND_REPO}", branch: 'dev' , credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                    }
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        sh './mvnw clean package -DskipTests' // Maven build for backend
                    }
                }
            }
        }
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                sh """
                                docker build -t ${REGISTRY}/${FRONTEND_IMAGE} --build-arg VITE_BACKEND_BASE_URL=http://backend:5000 \
                                    --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                                    --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download .
                                """
                            }
                        }
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                sh """
                                docker build -t ${REGISTRY}/${BACKEND_IMAGE} --build-arg SPRING_PROFILES_ACTIVE=prod \
                                    --build-arg SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/skycareportal \
                                    --build-arg SPRING_DATASOURCE_USERNAME=root \
                                    --build-arg SPRING_DATASOURCE_PASSWORD=root .
                                """
                            }
                        }
                    }
                }
            }
        }
        stage('Push Docker Images') {
            parallel {
                stage('Push Frontend Image') {
                    steps {
                        withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USER} --password-stdin"
                            sh "docker push ${REGISTRY}/${FRONTEND_IMAGE}"
                        }
                    }
                }
                stage('Push Backend Image') {
                    steps {
                        withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USER} --password-stdin"
                            sh "docker push ${REGISTRY}/${BACKEND_IMAGE}"
                        }
                    }
                }
            }
        }
        stage('Deploy to Staging') {
            when {
                branch 'dev'
            }
            steps {
                dir('backend') {
                    script {
                        sh 'docker-compose -f docker-compose.dev.yml up -d'
                    }
                }
            }
        }
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                dir('backend') {
                    script {
                        sh 'docker-compose -f docker-compose.prod.yml up -d'
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
