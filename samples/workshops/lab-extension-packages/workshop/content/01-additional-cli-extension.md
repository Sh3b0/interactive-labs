---
title: Workshop instructions
---

This workshop has added Educates CLI to the base workshop image to be used as an
additional CLI in the workshop.

This is done by adding the following snippet to the workshop resource definition:

```yaml
 apiVersion: training.educates.dev/v1beta1
  kind: Workshop
  metadata:
    name: "your-workshop"
  spec:
    ...
    workshop:
      files:
        - image:
            url: $(image_repository)/your-workshop-files:$(workshop_version)
          path: .
       packages:
        - name: educates-cli
          files:
            - path: .
              image:
                url: ghcr.io/educates/educates-extension-packages/educates:v3.3.2
    ...
```

You can verify that the Educates CLI is installed on this workshop:

```bash
educates version
```
