---
title: Deleting a pod
---

In this task you are required to delete the pod named "one" that you previously created.

The examiner is already running and will indicate when the task has been completed.

```examiner:execute-test
name: test-that-pod-does-not-exist
title: Verify that pod named "one" does not exist.
args:
- one
retries: .INF
delay: 1
autostart: true
```

Don't know how to delete the pod? One way is to execute the following command.

```bash
kubectl delete pod one
```
