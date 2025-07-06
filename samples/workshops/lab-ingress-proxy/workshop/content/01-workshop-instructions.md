---
title: Workshop instructions
---

We have a simple Python application that runs a hello-world server on port 8001.

```bash
cat hello-world.py
```

Let's run the application:

```bash
python3 hello-world.py
```

This application which runs inside our workshop environment is only accesible internally:

```bash-2
curl -v localhost:8001
```

Now, we can access our application in a workshop tab:

```dashboard:open-dashboard
name: application
```
