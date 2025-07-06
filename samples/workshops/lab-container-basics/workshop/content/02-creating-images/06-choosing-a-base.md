---
title: Choosing a Base
---

In the examples so far we have used the `busybox` container image. This image is convenient for demonstrations because it is small, but for real world applications it isn't really suitable.

For real world applications you will want to choose a more complete base image built from one of the more popular Linux distributions.

Popular choices for base images are:

* [Fedora](https://hub.docker.com/_/fedora)
* [CentOS](https://hub.docker.com/_/centos)
* [Debian](https://hub.docker.com/_/debian)
* [Ubuntu](https://hub.docker.com/_/ubuntu)
* [Alpine](https://hub.docker.com/_/alpine)

For the remainder of this workshop we will be using a Fedora base image.

Delete the `greeting` image created from the `busybox` image.

```bash
docker rmi greeting
```

Change location to the `~/greeting-v2` sub directory.

```bash
cd ~/exercises/greeting-v2
```

View the contents of the `Dockerfile` by running:

```bash
cat Dockerfile
```

This time you should see:

```
FROM fedora:37

COPY hello goodbye /

CMD [ "/hello" ]
```

Only the `FROM` instruction has been changed. This time the `fedora:37` base image is referenced instead of the `busybox` image.

Build the image by running:

```bash
docker build -t greeting .
````

The build may take a little bit longer as the `fedora` base image needs to be pulled down and it is somewhat larger than the more minimal `busybox` base image.

When the build has completed check that the container image runs:

```bash
docker run --rm greeting
```

Run the image again but this time create an interactive shell.

```bash
docker run -it --rm greeting /bin/bash
```

From the interactive shell, you can dig around inside the container image. You will see that it contains a complete base Fedora operating system environment.

When you are finished, shutdown the container by running:

```bash
exit
```
