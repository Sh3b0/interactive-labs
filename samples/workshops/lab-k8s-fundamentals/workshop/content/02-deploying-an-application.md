---
title: Deploying an Application
---

Now you have checked your access to the Kubernetes cluster is working, we are going to immediately jump in and deploy a complete application, consisting of a front end web application implementing a blog site, along with a PostgreSQL database for storing the blog posts.

This is to show you how quickly you can deploy a complete application to Kubernetes if you already have the configuration. Once the complete application has been deployed, we will delete the front end web application component, and deploy it again in steps so you can see how it fits together and how it uses Kubernetes.

The first part of the application we want to deploy is the PostgreSQL database. The set of resource files for deploying this can be found in the `database` directory.

```execute
ls -las database/
```

Each file in the directory contains a different resource definition which go together to make up the deployment for the application component.

Rather than try and dig into each file to work out what it defines, you can have Kubernetes tell you what resources it would create when the directory of resources is processed. To do this, run:

```execute
kubectl apply -f database/ --dry-run=client
```

This should output:

```
secret/blog-credentials created (dry run)
service/blog-db created (dry run)
persistentvolumeclaim/blog-database created (dry run)
deployment.apps/blog-db created (dry run)
```

The `kubectl apply` command in this case is what is used to create resources from a configuration file, or set of files contained in a directory. We used the `--dry-run=client` option, which tells us what objects would be created without creating any of the objects in the cluster. The `--dry-run` option also validates the resource definitions and will warn you if they contain errors.

If you are ever uncertain about what a command does, or what options it accepts, you can run it with the `--help` option.

```execute
kubectl apply --help
```
