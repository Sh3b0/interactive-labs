---
title: User input
---

We will create a pod with the user provided name

```examiner:execute-test
name: start-pod
prefix: Task
title: Start pod with name
inputs:
  schema:
    name:
      type: string
      title: "Name:"
      default: "my-app"
      required: true
  form:
  - "*"
  - type: submit
    title: Start
```

Stop the watch for pods in the namespace.

```execute-2
<ctrl-c>
```