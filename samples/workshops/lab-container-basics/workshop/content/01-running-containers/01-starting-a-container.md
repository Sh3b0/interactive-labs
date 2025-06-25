---
title: Starting a Container
---

To start an application inside of a container using `docker`, you need to have a container image. The container image acts as a packaging mechanism for distributing an application, and includes the application software, operating system files, libraries and other software required by the application to run.

Prebuilt container images for applications, or a base container image upon which you may build your own container image, are distributed using image registries.

The two main hosted image registry services that exist are [Docker Hub](https://hub.docker.com/) and [Quay.io](https://quay.io/). Support for hosting and distributing container images is also available from Git repository hosting services such as [GitHub](http://github.com/) and [GitLab](https://gitlab.com/).

To pull down and run an existing container image from an image registry using `docker` run:

```execute
docker run docker.io/busybox:latest date
```

The final output should be similar to:

```
Unable to find image 'busybox:latest' locally
latest: Pulling from library/busybox
e2334dd9fee4: Pull complete
Digest: sha256:a8cf7ff6367c2afa2a90acd081b484cbded349a7076e7bdf37a05279f276bc12
Status: Downloaded newer image for busybox:latest
Mon Apr 20 00:11:37 UTC 2020
```

The command logs details about the steps taken to pull down the image to the local environment. Once that process is complete, a container is started from the container image and the `date` command specified on the command line is run inside of the container. Because the `date` command exits immediately, the container is shutdown straight away.

In this case the container image which was used was called `busybox`. This is a very minimal Unix-like container image. We specified that the `latest` version of the container image be used, and that it should be pulled from the Docker Hub image registry (`docker.io`).

If you run the command a second time:

```execute
docker run docker.io/busybox:latest date
```

you will see that it executes the `date` command immediately and does not log any details about needing to first pull down the container image. This is because the container image has been cached in the local environment and will be used on subsequent runs.

You can see what container images have been pulled down to the local environment by running:

```execute
docker images
```

This should output details similar to:

```
REPOSITORY  TAG     IMAGE ID      CREATED     SIZE
busybox     latest  be5888e67be6  5 days ago  1.22MB
```

If necessary, `docker run` will pull down the container image the first time it is required. If you wanted to pull down images in advance of them being run, you can use the `docker pull` command:

```execute
docker pull docker.io/busybox:latest
```
