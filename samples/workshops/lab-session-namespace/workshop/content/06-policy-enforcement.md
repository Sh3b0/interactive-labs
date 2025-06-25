---
title: Policy Enforcement
---

In a plain Kubernetes cluster any type of container image can be run. This means
a user with access to the cluster can run applications as the `root` user, or
run a container in privileged mode, meaning that it is possible to access host
resources.

In the context of a training platform where untrusted users may have access to
workshops, and there is an ability to deployed workloads to the Kubernetes
cluster, being able to run applications as the `root` user or grant privileged
access is a security risk. For that reason Educates by default relies on Kyverno
to implement security policies which go beyond RBAC in controlling what a
workshop user can do, thereby restricting them from doing anything potentially
malicious.

Although using Kyverno as the policy enforcement engine, workshop sessions have
rules applied similar to `restricted` or `baseline` policies implemented by the
older pod security policies and newer pod security standards. Educates can be
reconfigured to use these alternate systems, or security context contraints if
deployed to OpenShift, but Kyverno is the recommended solution for cluster
security policy enforcement.
