---
title: Role Based Access
---

Even though a workshop user has access to the namespace created just for their
workshop session, access can be restricted further based on roles.

The default role which is applied is `admin`, which is more or less equivalent
to the standard cluster role called `admin` which exists in a Kubernetes
cluster, with some differences to restrict access to certain namespaced
resources types such as network policies.

If full admin rights over the session namespace is not needed, one can instead
reduce access by using the `edit` or `view` roles, although these are usually
only required when resources are pre-created in a session namespace and access
to those resources need to be restricted.

All these roles pertain only to standard Kubernetes resources in a namespace.
If a workshop requires access to custom resource types handled by operators
deployed to the cluster, then custom roles and role bindings can be specified
in a workshop definition granting the service account for the workshop session
additional access.

In any workshop where each workshop user is given access to a separate namespace
and everything otherwise operates against the same shared Kubernetes cluster,
access via roles should only be granted to namespaced resources. This mode of
operation is therefore not suitable for workshops which require any level of
cluster admin access from the terminal or which need to work with cluster scoped
resources. For these latter workshops, a virtual cluster should be enabled for
the workshop session.
