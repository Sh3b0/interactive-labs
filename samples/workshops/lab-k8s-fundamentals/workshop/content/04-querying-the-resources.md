---
title: Querying the Resources
---

The web console for a Kubernetes cluster can be used to display a visual representation, in your browser, of what resources have been created and the relationship between them, but most developers will interact with a Kubernetes cluster from the command line using `kubectl`.

To see a list of all the deployments in the current namespace which have already been created, run:

```execute
kubectl get deployment
```

This should yield output:

```
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
blog      2/2     2            2           5m
blog-db   1/1     1            1           5m
```

To narrow in on a specific resource, the name of that resource can be added to the command:

```execute
kubectl get deployment/blog
```

This should then yield output for just the one resource.

```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
blog   2/2     2            2           5m
```

To see much more detailed information about a resource `kubectl describe` can be used.

```execute
kubectl describe deployment/blog
```

For a deployment, just the start of what you should see is:

```
Name:                   blog
Namespace:              lab-k8s-fundamentals-w01-s001
CreationTimestamp:      Mon, 01 April 2022 00:00:00 +0000
Labels:                 app=blog
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=blog
Replicas:               2 desired | 2 updated | 2 total | 2 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
    ...
```

This is still in a semi human readable form and isn't suitable for machine processing. To instead see the raw resource definition, you can use the `-o yaml` display output option to `kubectl get`.

```execute
kubectl get deployment/blog -o yaml
```

Or if you prefer to work with JSON rather than YAML, you can use:

```execute
kubectl get deployment/blog -o json
```
