# Kubernetes local
brew install minikube

# Inicie cluster local
minikube start

# Kubectl
brew install kubectl

# Python e pip
brew install python

# Node (usado internamente pelo cdk8s-cli)
brew install node

# CDK8s CLI
npm install -g cdk8s-cli

# Validar

    minikube status
    kubectl get nodes
    cdk8s --version

# Gerar
    mkdir cdk8s-poc-python && cd cdk8s-poc-python
    cdk8s init python-app

    pip install -r requirements.txt

    cdk8s import k8s

Isso cria imports/k8s.py com todas as classes do core Kubernetes.

# Criar manifesto

    cdk8s synth
    dist/nginx-chart.k8s.yaml
    kubectl apply -f dist/

# Testar
    kubectl get pods
    kubectl get svc
    minikube service nginx-service
