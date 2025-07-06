---
title: Workshop instructions
---


Docker is installed and ready to be used in this workshop.

```bash
docker version
```

By default no image is available, but we can pull and run any image from any registry:

```bash
docker run -it --rm hello-world
```

With Educates Docker capabilities you can:
- Run docker containers
- Limit the amount of storage a session's docker capabilities will use
- Limit the amount of memory given to Docker
- Using Docker Compose to add additional services in your workshop's session
- Enable an [image registry per session](https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#enabling-session-image-registry)


And remember that everything that was created as part of every execution of the workshop is deleted
once the workshop is terminated, making Educates an ideal platform for delivering Docker related
content at scale.

Read more about Educates Docker's capabilities in the [official documentation](https://docs.educates.dev/en/stable/custom-resources/workshop-definition.html#enabling-ability-to-use-docker)