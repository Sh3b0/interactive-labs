---
title: Sharing Images
---

Once you have built your own custom container image you will need a way of distributing it if you need to run it on a different host system.

The normal way to distribute container images is to push them up to an image registry. Once they are pushed up to the image registry they can be pulled down to other hosts and run. For this you can use public image registries such as Docker Hub and Quay.io, or you could use your own private image registry.

To push an image to an image registry, you would first need to login to that image registry.

{{< registry-available >}}

In this workshop environment you have your own private image registry to which you have already been logged in. If you had to do it yourself you would use the ``docker login`` command, giving it the location of the image registry. You would then be prompted for the login credentials.

The next step is that you need to tag your container image with a name that incorporates the name of the image registry.

The name of your image at this point is ``greeting``, so to tag it with a name including the name of the image registry, you need to run:

```execute
docker tag greeting:latest {{% param registry_host %}}/greeting:latest
```

To push the image to the image registry, then run:

```execute
docker push {{% param registry_host %}}/greeting:latest
```

The command works out which image registry to push it to from the tag you added which includes the registry name.

Anyone with the appropriate access to the image registry could now pull it down to a different host by running:

```execute
docker pull {{% param registry_host %}}/greeting:latest
```

{{< /registry-available >}}

{{< registry-unavailable >}}

If you were using Docker Hub you could do this by running:

```
docker login -u username
```

It is not necessary to specify the server for Docker Hub in this case as the `docker` command defaults to using it when no alternate image registry is specified.

The next step is that you need to tag your container image with a name that incorporates the name of the image registry.

The name of your image at this point is ``greeting``, so to tag it with a name including the name of the image registry, you would run:

```
docker tag greeting:latest username/greeting:latest
```

Again, it is not necessary to specify the server for Docker Hub. If you were using an alternate image registry you would need to prefix your `username` value with the registry name.

To push the image to the image registry, you would then run:

```
docker push username/greeting:latest
```

The command works out which image registry to push it to from the tag you added which includes the registry name, or Docker Hub when not supplied.

Anyone with the appropriate access to the image registry could now pull it down to a different host by running:

```
docker pull username/greeting:latest
```

{{< /registry-unavailable >}}
