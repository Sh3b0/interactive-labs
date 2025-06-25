---
title: Terminal Environment
---

The Educates training platform is designed to be run in a Kubernetes cluster.
When a workshop is accessed a distinct Kubernetes deployment is created to host
the workshop dashboard for that workshop session. The shell environment provided
by the interactive terminals of the workshop dashboard run in a container of the
deployment for the workshop session.

You can see what processes are running in the container by executing:

```terminal:execute
command: ps ax
```

If you clicked on the action this should have automatically resulted in you
first being switched back to the terminal tab if it wasn't currently displayed.

The command should yield output similar to:

```
PID TTY      STAT   TIME COMMAND
  1 ?        Ss     0:00 /usr/bin/python3 /usr/bin/supervisord --nodaemon
103 ?        Rl     0:01 node build/backend/server.js
104 ?        Sl     0:01 node build/backend/server.js
127 pts/0    Ss+    0:00 terminal -il
129 pts/1    Ss     0:00 terminal -il
```

These are the processes which implement the workshop dashboard and provide
terminal access. Everything runs as a non `root` user and by default it is not
possible to escalate privileges and run anything as `root`.

The container image used when running the container for the workshop dashboard
and terminals provides a range of common UNIX utilities, including terminal
based editors such as `vi` and `nano`.

Because Educates was originally designed to provide a training platform for
teaching Kubernetes, the workshop image also provides tools such as `kubectl`,
`helm` and `k9s`, as well as YAML templating tools such as `kustomize` and those
from the Carvel toolset. Workshops can layer in more custom tools, or domain
specific workshop images for Java and Python can be used instead.

Although the interactive terminals run inside of a container inside Kubernetes,
whether you can access the Kubernetes cluster will depend on the workshop
definition. Even where access to the Kubernetes cluster is enabled, what a user
can do is constrained by role based access control (RBAC) as well as any
security policies which are enforced.

In this particular workshop no access token is provided for accessing the
Kubernetes cluster API server from the workshop container.
