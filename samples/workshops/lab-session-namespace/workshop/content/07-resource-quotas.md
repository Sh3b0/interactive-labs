---
title: Resource Quotas
---

Any workload deployed to the session namespace will have certain resources
requirements. If not constrained, or if no restrictions are placed on how much
resources can be requested for a workload, a workshop user could consume all
resources of the cluster.

To control the amount of resources that a workshop session can consume a
resource quota is applied to a session namespace. The allowed resource budget
can be specified using t-shirt sized quantities, eg., small, medium, large etc.
These control the maximum resource quota as well as default limit ranges for a
namespace. Where necessary the actual values can be selectively customized.

```terminal:execute
command: kubectl get resourcequotas,limits
```
