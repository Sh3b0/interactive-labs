---
title: Deleting Images
---

To delete images which you built locally, or which have been pulled down from a remote image registry, you can use the `docker rmi` command.

To list what images exist locally run:

```execute
docker images
```

To delete the images which you built during this workshop run:

```execute
docker rmi greeting:latest
```

{{< registry-available >}}

Because this image was re-tagged in order to push it to a remote registry, you will also need to delete that tagged version as well.

```execute
docker rmi {{% param registry_host %}}/greeting:latest
```

{{< /registry-available >}}

To delete the `busybox` image which was pulled down run:

```execute
docker rmi busybox:latest
```

When this is run you will however find that deleting the image will fail with an error similar to the following:

```
Error response from daemon: conflict: unable to remove repository reference "busybox:latest" (must force) - container d0e28a571497 is using its referenced image a416a98b71e2
```

This is because there is still a stopped container which used this image:

```execute
docker ps -a
```

The `docker` command will not by default allow you to delete an image which is still being used by a running container or even a stopped one.

To remove the stopped container from before, because it was named `session`, you can use the command:

```execute
docker rm session
```

You should now be able to delete the image.

```execute
docker rmi busybox:latest
```

Note that when building images you can also end up with orphaned image layers which will not be deleted using the above commands. To delete any image layers which are no longer required, you can run:

```execute
docker image prune
```

This will prompt you to confirm the action.

```terminal:input
text: Y
```
