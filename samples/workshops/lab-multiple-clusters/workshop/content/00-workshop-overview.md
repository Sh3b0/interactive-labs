---
title: Workshop Overview
---

The Educates training platform is a Kubernetes native application which provides
time limited sandboxes for hosted workshop environments.

This series of workshops demonstrates the capabilities of the Educates training
platform and how it can be used.

In this workshop you will get an overview of how to 


```terminal:execute
command: vcluster create --namespace {{< param session_namespace >}}-vc1 --kube-config-context-name cluster1 vc1
session: vc1
```

```terminal:execute
command: vcluster create --namespace {{< param session_namespace >}}-vc2 --kube-config-context-name cluster2 vc2
session: vc2
```
