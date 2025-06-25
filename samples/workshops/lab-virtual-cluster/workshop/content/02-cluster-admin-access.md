To verify what Kubernetes clusters the workshop user has access to run the
command:

```terminal:execute
command: kubectl config get-contexts
```

The output should be:

```
CURRENT   NAME          CLUSTER       AUTHINFO      NAMESPACE
*         my-vcluster   my-vcluster   my-vcluster   default
```

This is the virtual Kubernetes cluster. Note that there is no access to the
original Kubernetes cluster that Educates is hosted in, and which the virtual
clusters are also hosted in.

To check that the workshop user has cluster admin access and can see everything
in the cluster, you can run a command such as:

```terminal:execute
command: kubectl get pods -A
```

which lists all pods across all namespaces in the cluster.

You can also run:

```terminal:execute
command: kubectl get crds
```

to view what custom resource definitions the virtual cluster already knows
about.
