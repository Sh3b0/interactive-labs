---
title: Labelling of Resources
---

The ability to use `kubectl` to query resource definitions and their current status is important because it is the resource definitions which drive Kubernetes and what it does.

As we already saw, it isn't a single resource definition which defines everything about the deployment of an application, but a set of resources.

In order to indicate that a set of resources are related, they can be labelled. You can then perform queries to look up resources based on the labels.

In order to narrow the results down so it shows just the resources for the front end web application, we can add to the `kubectl get` command a label selector using the `-l` or `--selector` option.

```execute
kubectl get deployment,service,ingress,secret,pvc -o name -l app=blog
```

In this case we have also provided a comma separated list of the resources we wish to query about in addition to searching based on the applied labels.

This should yield:

```
deployment.apps/blog
service/blog
ingress.networking.k8s.io/blog
persistentvolumeclaim/blog-media
```

For the sample application you are deploying, all resources for the front end web application were given a label of `app=blog`.

One important use case for labels is when you want to delete an application. Where an application is defined by a set of resources, it is cumbersome and error prone to have to delete each resource one at a time. Using a label selector, you can delete them all at once.

The procedure for deleting an application would be to first use `kubectl get` with a label selector to determine that you have the correct set of resources, and then substitute `kubectl get` with the `kubectl delete` command.

Delete the front end web application now by running:

```execute
kubectl delete deployment,service,ingress,secret,pvc -l app=blog
```

This should output:

```
deployment.apps "blog" deleted
service "blog" deleted
ingress.networking.k8s.io "blog" deleted
persistentvolumeclaim "blog-media" deleted
```

Having deleted the front end web application, we will now re-deploy it, but this time we will do it one step at a time so you can understand what each of the resources is for and what Kubernetes does in response to the resource definitions being created.
