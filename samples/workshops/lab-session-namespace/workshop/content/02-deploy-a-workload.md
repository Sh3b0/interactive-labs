---
title: Deploy a Workload
---

To verify access to the session namespace and ensure we can deploy a workload,
lets deploy a simple blog application.

First create a watch command so we can monitor the resources as they are
created.

```terminal:execute
command: watch kubectl get deployments,replicasets,pods,services,ingress
session: 1
```

Now deploy the application.

```terminal:execute
command: |-
    ytt -f frontend \
        -v SESSION_NAMESPACE={{< param session_namespace >}} \
        -v INGRESS_DOMAIN={{< param ingress_domain >}} \
        -v POLICY_ENGINE={{< param policy_engine >}} | \
    kapp deploy -a frontend -f - -y
session: 2
```

In this case the YAML resources use `ytt` templating, so we pass them through
`ytt`, supplying data values as inputs corresponding to unique attributes for
this workshop session and the Educates deployment for this Kubernetes cluster.
We also used `kapp` to manage the deployment, although we could also have just
used `kubectl`.

When done, stop the watch which was run for resources.

```terminal:interrupt
session: 1
```
