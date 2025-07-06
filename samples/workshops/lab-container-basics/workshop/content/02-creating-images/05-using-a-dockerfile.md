---
title: Using a Dockerfile
---

Creating a container image interactively by running commands in a running container, or from a tarball created from a saved container image have their uses, but the primary way used to create container images is using a `Dockerfile`.

Change location to the `~/greeting-v1` sub directory.

```bash
cd ~/exercises/greeting-v1
```

List the files in the directory.

```bash
ls -las
```

The `Dockerfile` defines the details of the base image from which a new container image is to be created, along with the instructions to create it. View the contents of the `Dockerfile` by running:

```bash
cat Dockerfile
```

You should see:

```
FROM busybox:latest

COPY hello goodbye /

CMD [ "/hello" ]
```

The `FROM` instruction in the `Dockerfile` gives the name of the base image.

The `COPY` instruction is used to copy files from the local directory into the image.

The `CMD` instruction is used to set the command which should be run if the container image is run without specifying an explicit command.

To build a container image using the instructions in the `Dockerfile` run:

```bash
docker build -t greeting .
```

Look at the layers of the container image by running:

```bash
docker history greeting
```

The output should be similar to:

```
IMAGE               CREATED             CREATED BY                                      SIZE
COMMENT
0ac1216f0e3f        4 seconds ago       /bin/sh -c #(nop)  CMD ["/hello"]               0B
aeea9801fb6a        4 seconds ago       /bin/sh -c #(nop) COPY multi:03e82c91fe5fcae…   50B
be5888e67be6        5 days ago          /bin/sh -c #(nop)  CMD ["sh"]                   0B
<missing>           5 days ago          /bin/sh -c #(nop) ADD file:09a89925137e1b768…   1.22MB
```

You can see that a layer has been created in the container image for the `COPY` and `CMD` statements from our `Dockerfile`.

To run the container image, run:

```bash
docker run --rm greeting
```

Or to run an alternative command, use:

```bash
docker run --rm greeting /goodbye
```

For a full list of the instructions you can use in a `Dockerfile` check out the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/).
