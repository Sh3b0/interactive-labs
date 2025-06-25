---
title: Service Networking
---

The `pod` corresponding to each instance of your application is ephemeral. If it dies it is not resurrected. The `replicaset` ensures that a `pod` that has died is replaced with a new instance, as well as ensuring the correct number of `pods` exist when scaling the number of replicas up or down. When a new `pod` is created, it will always have a new name.

Each `pod`, as well as having a unique name, is also assigned it's own IP address. You can see the IP addresses assigned to each `pod` by running:

```execute
kubectl get pods -l app=blog -o wide
```

These IP addresses are only accessible within the Kubernetes cluster. Depending on the Kubernetes networking configuration, they may only be accessible from applications running in the same namespace.

Like with the names of `pods`, the IP addresses in use for an application will not stay the same over time. When a `pod` dies and is replaced, it can receive a completely different IP address. IP addresses cannot be relied upon for communicating between components in an application.

To add a stable IP address and hostname for an application, a `service` resource needs to be created. The IP address of a `service` will map to the set of `pods` which make up your application, with traffic to the IP address of the service being load balanced across the `pods`.

As with creating a `deployment`, the `kubectl` program provides methods for creating a `service`. These are `kubectl expose` and `kubectl create service`. We will skip these and use the resource definition. Run:

```execute
cat frontend-v2/service.yaml
```

to see the `service` definition. You should see:

```
apiVersion: v1
kind: Service
metadata:
  name: blog
  labels:
    app: blog
spec:
  type: ClusterIP
  selector:
    app: blog
  ports:
  - name: 8080-tcp
    port: 8080
    protocol: TCP
    targetPort: 8080
```

When used to create the resource object, this will result in a `service` named `blog` being created. The `ports` definition says that port 8080 will be exposed, with it mapping to port 8080 on the `pods`.

Update the current application configuration by running:

```execute
kubectl apply -f frontend-v2/
```

The output should be:

```
deployment.apps/blog unchanged
service/blog created
```

As the `frontend-v2` directory also contains our original `deployment.yaml` file, this will also ensure that the current deployment is brought into line with what it defines.

To review details of the `service` created run:

```execute
kubectl get service --selector app=blog -o wide
```

This will display output similar to:

```
NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE       SELECTOR
blog      ClusterIP   172.30.70.193   <none>        8080/TCP   1m        app=blog
```

You can see that the service has it's own IP address.

Another application running in the same namespace can connect on this IP address and port 8080 to talk to the front end web application.

The `service` will know what the corresponding `pods` are that traffic should be load balanced across by virtue of the label selector defined in the `service`. This is the `spec.selector` value:

```
  selector:
    app: blog
```

This means that the IP addresses for the `pods` resulting from a query of:

```execute
kubectl get pods -l app=blog -o name
```

will be registered as endpoints against the `service`.

You can see the IP addresses of the `pods` registered against the `service` by running:

```execute
kubectl get endpoints blog
```

Although the IP address will not change for the life of the `service` object, the IP should still not be used. Instead, a hostname corresponding to the `service` should be used. The hostname is the name of the `service`, is registered within an internal DNS in the Kubernetes cluster, and can be used by any application within the cluster.

For an application running in the same namespace, an un-qualifed hostname can be used. In this case `blog` would be the hostname. If networking in the cluster is configured to allow access across namespaces, an application in a different namespace can use the name with subdomain matching the name of the namespace, and the further domain of `svc.cluster.local`.

For the front end web application you have deployed, the URL for accessing it would be:

```
http://blog.{{< param session_namespace >}}.svc.cluster.local:8080
```

where `{{< param session_namespace >}}` is the subdomain added for the namespace.

You can test it works by running:

```execute
curl http://blog.{{< param session_namespace >}}.svc.cluster.local:8080
```

Note that this still isn't accessible outside of the Kubernetes cluster, extra steps are required to expose a `service` outside of the cluster. The `curl` command only works because the terminal you are using is running as a `pod` in the same Kubernetes cluster.
