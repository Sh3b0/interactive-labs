---
title: Pods and Containers
---

It has already been mentioned that a `pod` represents an instance of your application.

To be more precise, a `pod` is an abstraction which represents a group of running containers, where the containers are to be managed and scaled as a unit.

An instance of your application runs in one container of each `pod` resulting from the deployment. Where there would only be multiple `pods` if the replica count on the `deployment` was greater than 1.

In most cases a `pod` will consist of only a single container. There are use cases for running multiple containers in one `pod`, but they are generally the exception rather than the rule.

Looking at the sample application being used in this workshop, there are two separate deployments. One for the front end web application, and the other for the database.

They are separated as it allows the front end web application to be scaled up to multiple instances independent of the database. If both components had been created as part of the one deployment, running in separate containers of a `pod`, it would not be possible to scale the application up to multiple instances. This is because scaling a database isn't as simple as increasing the replica count.

The sequence of events which results in your application being run is therefore, that the `deployment` is created, from which a `replicaset` is created. From the `replicaset`, `pods` are created corresponding to the replica count specified in the `deployment`. For each `pod` created, a container is run using the container image supplied in the `deployment`. This is the instance of your application.
