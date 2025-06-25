---
title: Session Namespace
---

When a workshop has access to the Kubernetes cluster enabled, a workshop session
is provided access to a single Kubernetes namespace created in the cluster for
deploying workloads.

For this workshop session the name of that namespace is `{{< param session_namespace >}}`.

Run the command:

```terminal:execute
command: kubectl config get-contexts
```

and the output should be:

```
CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE
*         educates   educates   educates   {{< param session_namespace >}}
```

This indicates that the namespace will be configured as part of the default
context used by `kubectl`, so if a namespace is not specified when running
`kubectl`, this namespace will be used.

```terminal:execute
command: kubectl get serviceaccounts
```

Because of role based access controls (RBAC) applied to the service account
used for the workshop session, the session namespace is the only namespace
which would normally be accessible and usable by a workshop session.

Attempt to access namespaced resources in a different namespace:

```terminal:execute
command: kubectl get serviceaccounts -n default
```

and you will be blocked.

The service account used for the workshop session similarly has no access to
any cluster scoped resources. The only exception to this is that the set of
namespaces in the cluster can be accessed:

```terminal:execute
command: kubectl get namespaces
```

although as already noted, none of those other namespaces can be accessed.

The name of the session namespace is available in the environment variable
`SESSION_NAMESPACE` if required explicitly by applications run from the terminal
or session startup scripts. Workshop instructions can also use the interpolated
data variable `session_namespace`.
