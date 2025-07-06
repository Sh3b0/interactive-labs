---
title: Deploying a pod
---

In this this task you are required to deploy a pod. The name of the pod must be "one".

Before doing so, it is suggested you create a watch on pods in the namespace so you can monitor what happens.

```bash-2
watch kubectl get pods
```

The examiner is already running and will indicate when the task has been completed.

```examiner:execute-test
name: test-that-pod-exists
title: Verify that pod named "one" exists.
args:
- one
retries: .INF
delay: 1
autostart: true
```

Don't know how to deploy the required pod? One way is to execute the following command.

```bash
kubectl run one -it --image=busybox:latest --restart=Never -- sh
```

You could also have manually created a `Pod` resource definition as a YAML or JSON file and used it with `kubectl apply`.

If you used the above command to deploy the pod, you will need to exit from the interactive shell it created before continuing.

```bash
exit
```
