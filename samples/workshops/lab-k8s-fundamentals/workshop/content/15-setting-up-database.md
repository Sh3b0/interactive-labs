---
title: Setting up Database
---

For the front end web application being used, the database will be initialised if required when the application first starts up. What hasn't yet been done is to setup an administrator password for the front end web application itself. You might also want to load in some initial data, such as some posts for our blog site.

To do this we need to execute some commands within the running container for one of the instances of the front end web application.

Grab the name of one of the `pods` which are running:

```execute
POD=`kubectl get pod -l app=blog -o template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -1` && echo $POD
```

and create an interactive terminal session.

```execute
kubectl exec -it $POD -- bash
```

To setup an administrator password run:

```execute
just setup-app
```

This will ensure that the database has been initialised and then prompt for the user information. Enter a user name for the administrator:

```terminal:input
text: admin
```

Then an email address:

```terminal:input
text: admin@example.com
```

A password:

```terminal:input
text: this-is-secret
```

and confirm the password:

```terminal:input
text: this-is-secret
```

A final thing this setup script will do is also load some initial posts.

Exit the interactive shell by running:

```execute
exit
```

You should now be able to visit the blog site at:

```dashboard:open-url
url: http://blog-{{< param session_namespace >}}.{{< param ingress_domain >}}
```

and see the posts.

You can also if you want click on the person icon at the top right of the page, and login with the credentials entered. This will allow you to enter additional posts.
