---
title: Linking the Database
---

The front end web application is running and is accessible to the public internet. At this point it is using a file based SQLite database. This database is local to each instance, not shared between all (making it unsuited to a scaled application), and any changes to data will be lost whenever the `pod` restarts.

To provide persistence for data, and have all instances of the application using the same database, we will configure the front end web application to use the separate Postgresql database which is already running.

To view the resources for the database, run:

```execute
kubectl get deployment,service,pvc,secret -l app=blog-db -o name
```

This should yield:

```
deployment.apps/blog-db
service/blog-db
persistentvolumeclaim/blog-database
secret/blog-credentials
```

You should understand now the purpose of `deployment` and `service`. The `persistentvolumeclaim` is used to claim persistent storage for use by the database. The `secret` is used to hold the credentials for the database.

In order to link the database to the front end web application, we need to tell the front end web application the name of the host for the database, and what the login credentials are. To do this we need to add environment variable settings to the `deployment` for the front end web application.

You can see what environment variables are already set for the front end web application by running:

```execute
kubectl set env deployment/blog --list
```

This should display:

```
# Deployment blog, container blog
```

which at this point indicates that no environment variables have been specified with the `deployment`.

The way that the front end web application is implemented, it is expecting the following environment variables for a separate database.

* `DATABASE_HOST` - The host name of the database.
* `DATABASE_USER` - The user to login into the database.
* `DATABASE_PASSWORD` - The password of the user for the database.
* `DATABASE_NAME` - The name of the database.

To set environment variables, `kubectl` provides the command `kubectl set env`. We don't want to update the live configuration, but keep the configuration locally, but we can use it to work out the changes we need to make to that configuration.

For the database host, the host name will be the name of the database `service` object, which is `blog-db`.

To see what the `deployment` configuration would look like with that set, we can run:

```execute
kubectl set env deployment/blog DATABASE_HOST=blog-db --dry-run=client -o yaml
```

From the output, you can see that the `DATABASE_HOST` environment variable would have been added. This is under the `spec.template.spec.containers.env` setting.

```
    spec:
      containers:
      - env:
        - name: DATABASE_HOST
          value: blog-db
```

The database credentials could be added in a similar way, but for this application we already have those stored in the `secret` for the database. You can view the `secret` called `blog-credentials`:

```execute
kubectl get secret/blog-credentials -o yaml
```

Within the output you will see the `data` section holding values:

```
data:
  database-name: YmxvZw==
  database-password: dG9wLXNlY3JldA==
  database-user: YmxvZw==
```

What you see aren't the actual values as they have been obfuscated using base64 encoding.

In order to use the same values, but not actually have to copy them, you can configure the `deployment` to inject the environment variables from the secret. To see how the configuration should look for this you can run:

```execute
kubectl set env deployment/blog --from secret/blog-credentials --dry-run=client -o yaml
```

For these, the `spec.template.spec.containers.env` setting would need to be updated to:

```
    spec:
      containers:
      - env:
        - name: DATABASE_NAME
          valueFrom:
            secretKeyRef:
              key: database-name
              name: blog-credentials
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              key: database-password
              name: blog-credentials
        - name: DATABASE_USER
          valueFrom:
            secretKeyRef:
              key: database-user
              name: blog-credentials
```

Combining these with the `DATABASE_HOST` environment variable we need to set the `deployment` to be:

```execute
cat frontend-v4/deployment.yaml
```

To apply this configuration run:

```execute
kubectl apply -f frontend-v4/
```

The database and the front end web application are now linked, but some extra steps are required to initalise the database.
