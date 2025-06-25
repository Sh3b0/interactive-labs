When listing the custom resource definitions existing in the virtual cluster
you will have seen:

```
apps.kappctrl.k14s.io
internalpackages.internal.packaging.carvel.dev
internalpackagemetadatas.internal.packaging.carvel.dev
packageinstalls.packaging.carvel.dev
packagerepositories.packaging.carvel.dev
```

These exist because when creating a virtual cluster, it is possible to declare
resources that should automatically be created in the virtual cluster once it
is ready.

Pre-creating resources can be performed in two different ways.

The first method is to rely on the presence of `kapp-controller` in the host
Kubernetes cluster that Educates is running in, to deploy application resources
into a separate Kubernetes cluster by supplying the `kubeconfig` file for the
virtual cluster.

A second method is to specify a list of resources to be created directly in the
virtual cluster when it is being setup.

In the case of the custom resource types listed above, these were created using
the first method, by having `kapp-controller` in the host Kubernetes cluster,
bootstrap deployment of the `kapp-controller` into the virtual cluster.

An example of the second method employed in this workshop was to have a secret
created in the virtual cluster containing the SSH key pair which is generated
for each workshop session.

```terminal:execute
command: kubectl get secrets
```
