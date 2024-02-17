
            // В качестве DinD не стоит использовать версии образа ниже, поскольку на исполнении некоторых команд
            podTemplate(yaml: '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: docker
                    image: docker:20.10.17-dind
                    command: ["dockerd-entrypoint.sh", "--insecure-registry=docker:5000", "--insecure-registry=docker.keepup:5000"]
                    securityContext:
                      privileged: true
                    env:
                    - name: DOCKER_TLS_CERTDIR
                      value: ""
                  imagePullSecrets:
                  - name: regcred
            ''')
            {
                environment {
                    DOCKERHUB_CREDENTIALS=credentials('jenkins-gitlab')
                }
                node(POD_LABEL) {
                    stage('Prepare environment') {
                        container('docker') {
                        sh "echo 192.168.10.135   docker >> /etc/hosts "
                        sh "echo 192.168.10.35   docker.keepup >> /etc/hosts "
                    }
                }
                stage('Build Docker image') {
                    git url: 'https://github.com/FedorSergeev/graph-visualizer.git', branch: 'feature/sequence-graph'
                    container('docker') {
                        sh "docker build -t docker.keepup:5000/ckeepup/graph-visualizer:0.1.5-${currentBuild.number} --network host ."
                    }
                }
                stage('Docker login') {
                    withCredentials([usernamePassword(credentialsId: 'jenkins-gitlab', passwordVariable: 'DOCKER_CREDS_PASSWORD', usernameVariable: 'DOCKER_CREDS_USERNAME')]) {
                        container('docker') {
                            sh 'echo "$DOCKER_CREDS_PASSWORD" | docker login docker.keepup:5000 --username jenkins --password-stdin'
                        }
                    }
                }
                stage('Push to docker registry') {
                    container('docker') {
                        sh "docker push docker.keepup:5000/ckeepup/graph-visualizer:0.1.5-${currentBuild.number}"
                    }
                }
            }
        }

