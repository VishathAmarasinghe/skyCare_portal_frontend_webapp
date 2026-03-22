// Multibranch: branch `dev` → staging build, branch `main` → production build.
// Images are tagged per environment so staging and production do not overwrite each other on the same host.
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
                    '''
                }
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
                    '''
                }
            }
        }
    }
    post {
        success {
            echo 'Frontend image built. Run the backend multibranch pipeline on the same agent to deploy (compose pulls frontend:staging or frontend:production).'
        }
        failure {
            echo 'Frontend pipeline failed.'
        }
    }
}
