---
title: Workshop Instructions
---

In order to use this image, your workshop definition will have to be configured 
to use the `conda-environment` base image:

```yaml
...
spec:
  description: "Overview of working on Python applications."
  ...
  workshop:
    image: conda-environment:*
...
```

You can verify conda version that by running:

```bash
conda --version
```