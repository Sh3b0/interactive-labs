---
title: Cluster Ingress
---

With the deployment completed, test access to the application by running:

```terminal:execute
command: curl http://blog-{{< param session_namespace >}}.{{< param ingress_domain >}}/
```

If this fails, keep running it as depending on the cluster and infrastructure
used it may take time for services and ingresses to be set up correctly.

Note that in this case we were able to piggy back off the fact that Educates
already has a wildcard ingress domain for the cluster, thus we were able to set
up an ingress and expose the application outside of the cluster. We just needed
to ensure the hostname for the application was qualified using the name of
the workshop session as the policy engine used by Educates will enforce this so
that different workshop users cannot interfere with anything outside of their
own workshop session.

To display that the application is working we could also open the URL in the
browser:

```dashboard:open-url
url: http://blog-{{< param session_namespace >}}.{{< param ingress_domain >}}/
```
