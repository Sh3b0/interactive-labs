---
title: Namespace vs Cluster
---

Making use of the fact that Educates runs in a Kubernetes cluster, where a
workshop is about deploying workloads to Kubernetes, the default way of allowing
a workshop user to deploy to the cluster is to provide them access to a single
namespace in the same cluster Educates is running.

In order to apply some measure of control on what can be done from a workshop
session, the service account associated with the workshop session can only
create namespaced resources in the namespace created for that specific workshop
session. Security policies and resources quotas impose further limitations to
control what can be done and how many resources can be consumed.

There is provision to allow access to additional namespaces if more than one is
required, but these are all tied to the specific workshop session and the
workshop user cannot create their own namespaces.

Although suitable for many types of workshops which require Kubernetes, these
restrictions means this mode of Kubernetes access is not suitable for workshops
where a workshop user needs any level of cluster admin access to a Kubernetes
cluster.

To cater for workshops where cluster admin access is required, one can instead
make use of a virtual Kubernetes cluster. What is able to be done in this
cluster is still constrained by any cluster security policies or session
resource quotas, but does provide the impression of having cluster admin access,
although in practice they are just working with a virtual cluster which runs out
of their session namespace.
