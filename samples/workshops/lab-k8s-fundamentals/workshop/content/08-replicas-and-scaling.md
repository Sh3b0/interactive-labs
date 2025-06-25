---
title: Replicas and Scaling
---

One example of updating the `deployment` is to change the number of replicas, or instances of your application which are running. To effect this change you would need to change the value of `spec.replicas` in the `deployment`.

The `kubectl` command provides an imperative command for updating the number of replicas. To increase the number of replicas to 3, run:

```execute
kubectl scale deployment/blog --replicas 3
```

This will output:

```
deployment.apps/blog scaled
```

and if you run:

```execute
kubectl get pods -l app=blog
```

you should now see that there are 3 pods running instead of the original 2.

If you ran the command fast enough, you may see a `pod` listed as being in `Pending` or `ContainerCreating` state. This is the new `pod` when it is starting up. Keep running `kubectl get pods` until you see 3 `pods` in the `Running` state.

The problem with having run `kubectl scale` is that the configuration in Kubernetes no longer matches what we used to originally create the `deployment`. This means we wouldn't be able to replicate the application deployment, as it existed in Kubernetes at that point, by deploying the original configuration alone.

To reset the configuration in Kubernetes back to what we had before running `kubectl scale` you can run `kubectl apply` with the original configuration we had in our local configuration file.

```execute
kubectl apply -f frontend-v1/
```

Run:

```execute
kubectl get pods -l app=blog
```

again and you will see that you are back to 2 replicas.

If you ran the command fast enough after applying the original configuration you may see a `pod` listed as being in `Terminating` state. This is the `pod` which is being shutdown in order to bring the number of replicas back to 2. Keep running `kubectl get pods` until you see the number in the `Running` state return back to 2.

This continual process whereby Kubernetes will ensure that the number of instances of your application, i.e., `pods`, matches the desired number of replicas specified in the `deployment`, comes into play in another way as well. This is that if an instance of your application was killed, Kubernetes will replace it automatically.

You can simulate this scenario by deleting one of the `pods`. To see what happens, first run in one terminal:

```execute-1
watch kubectl get pods -l app=blog
```

This will periodically run `kubectl get pods` so we can monitor the pods over time and show any changes.

Now from another terminal delete one of the `pods`.

```execute-2
kubectl delete `kubectl get pod -l app=blog -o name | head -1`
```

You should see the `pod` which was targeted being marked as `Terminating` and it will be removed. Because though the desired number of replicas is 2, a new instance of your application will be automatically started to replace it.

When complete, interrupt the watch command to stop it.

```terminal:interrupt
```
