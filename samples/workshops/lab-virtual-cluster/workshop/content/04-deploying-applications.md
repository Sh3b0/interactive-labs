With full access to the virtual cluster, more or less any application can be
deployed to the cluster. There will be restrictions in the case of this
workshop due to resource quota restrictions, but you can readily create
cluster scope resources, including namespaces.

Create a new namespace to deploy our test application:

```terminal:execute
command: kubectl create ns my-app
```

Then deploy the application:

```terminal:execute
command: |-
    ytt -f frontend \
        -v SESSION_NAMESPACE={{< param session_namespace >}} \
        -v INGRESS_DOMAIN={{< param ingress_domain >}} \
        -v POLICY_ENGINE={{< param policy_engine >}} | \
    kapp deploy -n my-app -a frontend -f - -y
```

When using a virtual cluster, the embedded Kubernetes console can still be
used but will only have visibility of the virtual cluster.

```dashboard:reload-dashboard
prefix: Console
title: View deployment for "blog"
description: ""
name: Console
url: {{< param ingress_protocol >}}://console-{{< param session_namespace >}}.{{< param ingress_domain >}}/#/deployment/my-app/blog?namespace=my-app
```

Once the deployment has completed, you can test access to the application
by running:

```terminal:execute
command: curl http://blog-{{< param session_namespace >}}.{{< param ingress_domain >}}/
```

Note that although we are operating in the context of a virtual cluster, we can
still create an ingress for the application to make it accessible outside of
the cluster.

Due to restrictions in the workshop environment, the hostname must embed the
name of workshop session when placed immediately under the ingress domain used
by Educates. Here for example we used:

```
blog-{{< param session_namespace >}}.{{< param ingress_domain >}}
```

as the hostname in the ingress.

Alternatively, one can create new hosts under the special ingress domains:

```
{{< param session_namespace >}}.{{< param ingress_domain >}}
default.{{< param session_namespace >}}.{{< param ingress_domain >}}
```

If necessary, additional subdomains in addition to `default` can be declared
and used.
