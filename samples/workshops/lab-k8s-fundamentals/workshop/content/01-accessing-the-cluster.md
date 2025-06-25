---
title: Accessing the Cluster
---

For the exercises you will be doing, you will be using the `kubectl` command line program to interact with Kubernetes. This is provided for you via the interactive terminal session accessible through the **Terminal** tab, here in the workshop environment. You do not need to install anything on your own computer. You will be doing everything here through your web browser. There is no need to login as you are already connected to the Kubernetes cluster you will be using.

The workshop environment also provides you with a web based view into the Kubernetes cluster. This is available through the **Console** tab of the workshop environment. This is included so you can visually see the results of what you do in the exercises, but the exercises do not depend on it.

Before continuing, verify that the `kubectl` command runs and the workshop environment is also functioning. To do this run:

```execute
kubectl version
```

Did you type the command in yourself? If you did, click on the command instead and you will find that it is executed for you. You can click on any similar command block in the workshop notes and it will be copied to the interactive terminal and run for you. Other action blocks may also be used in this workshop which will similarly perform the action described when clicked on.

When run, you should see output similar to:

```
Client Version: v1.32.2
Kustomize Version: v5.5.0
Server Version: v1.32.2
```

The version of Kubernetes being used may be different to the version shown here.
