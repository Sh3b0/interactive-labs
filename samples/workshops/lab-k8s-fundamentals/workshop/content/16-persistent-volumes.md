---
title: Persistent Volumes
---

One of the resources associated with the database was a persistent volume. We also need a persistent volume for the front end web application. This is required because although the blog post content is stored in the database, any image attached to the post is stored in the file system. As the container file system is ephemeral, the images would be lost when a `pod` is killed. The container file system is also not shared between the multiple instances of the application.

To add persistent storage to an application, the first step is that you need to create a persistent volume claim. This tells Kubernetes that you need storage, how big the volume needs to be and what type of storage is required.

The resource definition for the persistent volume claim we need to use can be seen by running:

```execute
cat frontend-v5/persistentvolumeclaim.yaml
```

You should see that it contains:

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: blog-media
  labels:
    app: blog
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

This says that the storage should be at least of size 1Gi and that the access mode should be `ReadWriteOnce`.

Kubernetes supports three different access modes for storage.

* `ReadWriteOnce` (RWO) - The volume can be mounted as read/write by a single node.
* `ReadOnlyMany` (ROX) - The volume can be mounted as read-only by many nodes.
* `ReadWriteMany` (RWX) - The volume can be mounted as read/write by many nodes.

What access modes for storage are available will depend on the Kubernetes cluster.

For the front end web application we are using, because we want to be able to run multiple instances, we technically need storage with an access mode that allows it to be mounted on multiple nodes in the Kubernetes cluster. This is because instances of the application could run on different nodes. As such `ReadWriteMany` should be the requested storage access mode.

At this point you may be confused since the above persistent volume claim actually specifies `ReadWriteOnce`. For this workshop this is the case as we can't be sure a Kubernetes cluster will have storage of type `ReadWriteMany`. As a result we cheat. We request storage of type `ReadWriteOnce` and set a condition on the `deployment` for the front end to force all pods for the application to be scheduled to the same node, thus allowing us to use `ReadWriteOnce`. In a real system it is generally regarded as bad practice to force an application when scaled to run on a single node, but we don't have much choice here. For your own application, if it needs to be scaled or use rolling deployments, you should use `ReadWriteMany`.

In contrast, the database will only ever have one instance and so storage with access mode `ReadWriteOnce` is sufficient.

In addition to creating the persistent volume claim, the `deployment` needs to be updated.

At `spec.template.spec.volumes` in the `deployment` we need to add:

```
      volumes:
      - name: media
        persistentVolumeClaim:
          claimName: blog-media
```

This indicates the persistent volume claim is to be used.

At `spec.template.spec.containers.volumeMounts`, we neeed to add:

```
        volumeMounts:
        - name: media
          mountPath: "/opt/app-root/media"
```

This indicates that the persistent volume should be mounted at the path `/opt/app-root/media` in the container.

To see the updated `deployment` configuration run:

```execute
cat frontend-v5/deployment.yaml
```

To apply the configuration changes run:

```execute
kubectl apply -f frontend-v5/
```

This should output:

```
deployment.apps/blog configured
ingress.networking.k8s.io/blog unchanged
persistentvolumeclaim/blog-media created
service/blog unchanged
```

Both components of the application, the database and the front end web application are fully deployed once again.
