---
title: Replicasets and Pods
---

Having created the `deployment` run:

```execute
kubectl get all -o name -l app=blog
```

The `all` value is not a resource type, but a short hand alias for the core Kubernetes resource types. It shows what we need here, but to be sure to get everything you want, you are usually better to list the resource types explicitly.

The output should be similar to:

```
pod/blog-6b8999855c-6jjhj
pod/blog-6b8999855c-zk8pg
deployment.apps/blog
replicaset.apps/blog-6b8999855c
```

If you see any errors about not being able to list resource types, this is because your user doesn't have the access roles which allow making queries about the resource type. This might occur where authors of Kubernetes operators have not followed best practices, and have added custom resources types to the `all` alias. This shouldn't be done as the `all` alias should only be used by Kubernetes core itself and not third party developers. This is another reason why it is better to list the specific resource types you are interested in.

Although you only created the `deployment`, this has resulted in the creation of additional resources for `replicaset` and `pod`.

This is because `deployment` acts as a template for the creation of a `replicaset`. A `replicaset` in turn acts as a template for the creation of the `pods`. It is the `pods` which represent the instances of your application. In this case, because the number of replicas has been set to 2, there are 2 pods.

To view the resource definition for the `replicaset` run:

```execute
kubectl get replicaset -l app=blog -o yaml
```

In this you will see that the `spec` section contains:

```
 spec:
    replicas: 2
    selector:
      matchLabels:
        app: blog
        pod-template-hash: 7b747746cc
    template:
      metadata:
        creationTimestamp: null
        labels:
          app: blog
          pod-template-hash: 7b747746cc
      spec:
        containers:
        - image: ghcr.io/educates/lab-k8s-fundamentals-frontend:3.0
          imagePullPolicy: Always
          name: blog
          ports:
          - containerPort: 8080
            protocol: TCP
          resources: {}
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
        dnsPolicy: ClusterFirst
        restartPolicy: Always
        schedulerName: default-scheduler
        securityContext: {}
        terminationGracePeriodSeconds: 30
```

This has been filled out with what was provided in the `spec` portion of the `deployment`.

To view the resource definitions for the `pods` run:

```execute
kubectl get pod -l app=blog -o yaml
```

Here the fields from `spec.template` of the `replicaset` have been used in creating the `pod` resource definition. The `spec.template` of a `deployment` and `replicaset` is what is referred to as the pod template.

In both `replicaset` and `pod` you will see that a lot of additional fields have been added along the way. This is because they are being filled out with defaults for values which weren't specified in the original `deployment`. The resource definitions also contain fields which help track the status of whatever the resource represents.

In the case of the inherited defaults, these may be from the resource type, but also may be inherited in part from the global or namespace configuration. This is the case for the resource limits on CPU and memory, which have been inherited from limits set for the namespace you are working in.

In any case, if these defaults turn out not to be correct and you need to change them, or you need to add additional settings, the change should be made in the `deployment`. You should not edit `replicaset` or `pod` directly yourself. Update the `deployment` instead. The instances of `replicaset` and `pod` will be correspondingly updated for you.

When it comes to deleting an application, as we did previously for the front end web application, there is no need to explicitly delete either the `replicaset` or `pods`. This is because the `pods` are marked up as being owned by the `replicaset` they are created from, and the `replicaset` is marked as being owned by the `deployment`. When you delete the `deployment`, the `replicaset`, and the `pods` created from it, will be automatically deleted.
