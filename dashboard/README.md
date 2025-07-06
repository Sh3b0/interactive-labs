# Deploy K8s Dashboard

0. Install dashboard

    ```bash
    # Add kubernetes-dashboard repository
    helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
    
    # Deploy a Helm Release named "kubernetes-dashboard" using the kubernetes-dashboard chart
    helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard
    ```

1. Apply manifests (ServiceAccount and ClusterRoleBinding)

    ```bash
    kubectl apply -f dashboard.yml
    ```

2. Create token

    ```bash
    kubectl -n kubernetes-dashboard create token admin-user
    ```

3. Access dashboard

    ```bash
    kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-kong-proxy --address 0.0.0.0 8443:443
    ```
