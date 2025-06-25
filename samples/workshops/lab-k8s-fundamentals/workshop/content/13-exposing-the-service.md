---
title: Exposing the Service
---

In order to expose a `service` so that it is accessible outside of the Kubernetes cluster, you need to create an `ingress` resource object.

To see the definition for the `ingress` resource object we will use run:

```execute
cat frontend-v3/ingress.yaml
```

You should see output:

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blog
  labels:
    app: blog
spec:
  rules:
  - host: blog-{{< param session_namespace >}}.{{< param ingress_domain >}}
    http:
      paths:
      - path: "/"
        pathType: Prefix
        backend:
          service:
            name: blog
            port:
              number: 8080
```

The `rules` section in the `ingress` definition is what controls what should happen when traffic for your web application is received by the router for the Kubernetes cluster.

In this case the rule says that any HTTP requests received for the host `blog-{{< param session_namespace >}}.{{< param ingress_domain >}}` should be directed to the application with `service` object named `blog`.

When an external user accesses the host name from their web browser, they will use the standard port 80 for HTTP traffic, the router will pass through that traffic to port 8080 of the `service`.

To update the configuration for the front end web application to add the `ingress` run:

```execute
kubectl apply -f frontend-v3/
```

This should output:

```
deployment.apps/blog unchanged
ingress.networking.k8s.io/blog created
service/blog unchanged
```

You can review the `ingress` resource which was created by running:

```execute
kubectl get ingress -l app=blog
```

Now that the `ingress` has been created, you can access the front end web application using a web browser at:

```dashboard:open-url
url: http://blog-{{< param session_namespace >}}.{{< param ingress_domain >}}
```

Visit the front end web application by clicking on this link. If it shows as not being available, keep refreshing the page until it is. This is necessary as it make take a few moments to reconfigure the ingress routing layer.

Note that this works because a wildcard CNAME has already been pre-configured in an external domain name server (DNS) to direct traffic for this host to the router for the Kubernetes cluster. If this was your own Kubernetes cluster, you would need to configure an appropriate CNAME in the DNS for the host you want to use.
