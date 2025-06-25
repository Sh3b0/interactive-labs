---
title: Accessing Containers
---

To gain access to the container in which an instance of an application is running, and run a command, you can use `kubectl exec`.

As with logging, you need to specify the particular `pod` you want to access, and if there are multiple containers running in the `pod`, specify which container using the `-c` or `--container` option.

```execute
kubectl exec $POD -- env
```

If you want to run an interactive terminal session, you need to ensure you use the `-i` or `--stdin` option, and the `-t` or `--tty` option.

```execute
kubectl exec -it $POD -- bash
```

From the interactive shell, you can view files in the file system.

```execute
ls -las
```

and can interact with the application processes:

```execute
ps x
```

The only processes you will be able to see are those for the instance of your application running in that container. You cannot see processes running in other containers of the same `pod`, or operating system processes.

Run:

```execute
exit
```

to end the interactive terminal session for the container.

As with logs, you can use `kubectl exec` against the deployment, but you will not know which pod it will be run against if there is more than one.
