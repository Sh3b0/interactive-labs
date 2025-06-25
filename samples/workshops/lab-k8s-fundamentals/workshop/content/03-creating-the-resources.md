---
title: Creating the Resources
---

By doing a dry run deployment, you have seen the resources that will be created. To actually deploy the database component, now run:

```execute
kubectl apply -f database/
```

As with the dry run, `kubectl apply` will list the resources, except this time the resources will be created.

```
secret/blog-credentials created
service/blog-db created
persistentvolumeclaim/blog-database created
deployment.apps/blog-db created
```

The key resource in this list is `deployment`. It specifies the name of the container image to be deployed for an application, how many instances should be started, and the strategy for how the deployment should be managed.

To monitor progress of the deployment, and know when it has completed, you can run the command:

```execute
kubectl rollout status deployment/blog-db
```

The argument is the full name of the resource, including the type of resource and the name for this instance. In this case the instance was called `blog-db`.

With the database deployed, now deploy the front end web application by running:

```execute
kubectl apply -f frontend/
```

This should output:

```
persistentvolumeclaim/blog-media created
deployment.apps/blog created
service/blog created
ingress.networking.k8s.io/blog created
```

Run:

```execute
kubectl rollout status deployment/blog
```

to monitor and wait for it to be deployed.

Notice that an `ingress` object is created for the front end web application. This object sets up access to our web application using a publicly accessible URL.

In this example, the URL for accessing the web application will be:

```dashboard:open-url
url: http://blog-{{< param session_namespace >}}.{{< param ingress_domain >}}
```

Visit the front end web application by clicking on this link. If it shows as not being available, keep refreshing the page until it is. This is necessary as it may take a few moments to reconfigure the ingress routing layer.

There will not be any blog posts displayed as yet. We will get to setting up and populating the database later.
