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
                        sh 'ls -R'
                    }
                    dir('backend') {
                        git url: "${BACKEND_REPO}", branch: 'main', credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                        sh 'ls -R'
                    }
                    dir('frontend') {
                        git url: "${FRONTEND_REPO}", branch: 'dev' , credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                        sh 'ls -R'
                    }
                    dir('backend') {
                        git url: "${BACKEND_REPO}", branch: 'dev' , credentialsId: 'GITHUB_VISHATH_CREDENTIALS'
                        sh 'ls -R'
                    }
                }
            }
        }
        stage('Deploy to Staging') {
            // when {
            //     branch 'dev'
            // }
            steps {
                dir('frontend') {
                            script {
                                sh """
                                docker build -t ${FRONTEND_IMAGE} --build-arg VITE_BACKEND_BASE_URL=http://backend:5000 \
                                    --build-arg VITE_APPLICATION_ADMIN=admin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_SUPER_ADMIN=superadmin.skyCarePortal \
                                    --build-arg VITE_APPLICATION_CARE_GIVER=caregiver.skyCarePortal \
                                    --build-arg VITE_FILE_DOWNLOAD_PATH=/file/download .
                                """
                            }
                }
                dir('backend') {
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
                dir('backend') {
                    script {
                        sh 'docker-compose -f docker-compose.dev.yml up -d'
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
