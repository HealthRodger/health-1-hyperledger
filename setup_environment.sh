#!/bin/bash

set -eo pipefail

RESOURCES_DIR="./resources"
KIND_CONFIG="${RESOURCES_DIR}/kind-config.yaml"
ISTIO_VERSION="1.16.1"

mkdir -p ${RESOURCES_DIR}

# Create Kubernetes Cluster
cat << EOF > ${KIND_CONFIG}
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30949
    hostPort: 80
  - containerPort: 30950
    hostPort: 443
EOF

echo "Creating Kubernetes cluster..."
kind create cluster --config=${KIND_CONFIG}

echo "Installing hlf-operator"
helm repo add kfs https://kfsoftware.github.io/hlf-helm-charts --force-update
helm install hlf-operator --version=1.8.2 kfs/hlf-operator
kubectl krew install hlf

# Install Istio
echo "Installing Istio..."
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=${ISTIO_VERSION} TARGET_ARCH=x86_64 sh -
export PATH="$PATH:$PWD/istio-${ISTIO_VERSION}/bin"

echo "Creating istio-system namespace..."
kubectl create namespace istio-system

echo "Initializing Istio operator..."
istioctl operator init

# Apply IstioOperator custom resource to deploy Istio
kubectl apply -f - <<EOF
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: istio-gateway
  namespace: istio-system
spec:
  addonComponents:
    grafana:
      enabled: false
    kiali:
      enabled: false
    prometheus:
      enabled: false
    tracing:
      enabled: false
  components:
    ingressGateways:
      - enabled: true
        k8s:
          hpaSpec:
            minReplicas: 1
          resources:
            limits:
              cpu: 500m
              memory: 512Mi
            requests:
              cpu: 100m
              memory: 128Mi
          service:
            ports:
              - name: http
                port: 80
                targetPort: 8080
                nodePort: 30949
              - name: https
                port: 443
                targetPort: 8443
                nodePort: 30950
            type: NodePort
        name: istio-ingressgateway
    pilot:
      enabled: true
      k8s:
        hpaSpec:
          minReplicas: 1
        resources:
          limits:
            cpu: 300m
            memory: 512Mi
          requests:
            cpu: 100m
            memory: 128Mi
  meshConfig:
    accessLogFile: /dev/stdout
    enableTracing: false
    outboundTrafficPolicy:
      mode: ALLOW_ANY
  profile: default
EOF

echo "Environment setup completed. WARNING: Before network set up, check if environment is ready with command: kubectl wait --for=condition=available --timeout=600s deployment --all -n istio-system"
