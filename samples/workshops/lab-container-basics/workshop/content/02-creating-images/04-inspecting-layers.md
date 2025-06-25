---
title: Inspecting Layers
---

To inspect the layers of the container image you just created, run:

```execute
docker history greeting
```

The output should be similar to:

```
IMAGE               CREATED             CREATED BY                                      SIZE
COMMENT
bd7223c52540        23 seconds ago      sh                                              124B
be5888e67be6        5 days ago          /bin/sh -c #(nop)  CMD ["sh"]                   0B
<missing>           5 days ago          /bin/sh -c #(nop) ADD file:09a89925137e1b768…   1.22MB
```

The top layer has captured the changes you made from the interactive shell session of the running container. The other layers were inherited from the `busybox` container image.

Because you constructed the container image from a running container, there is no way to see what individual commands you ran, or what files you copied into the container.

To see the metadata for the container image, you can also run:

```execute
docker inspect greeting
```

This includes details on the layers, but also information about the command run when the container image is run, and details of any environment variables set by the container image.
