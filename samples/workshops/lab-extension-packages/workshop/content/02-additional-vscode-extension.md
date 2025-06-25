---
title: Workshop instructions
---

This workshop has also added a VS Code extension to the base workshop image. In this case
we're adding the Microsoft VS Code Java Extension Pack. 

**NOTE** That this extension would really need to work on a java based image, which this is not, 
as this example is just for ilustrational purposes.

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
        - name: vscode-tools
          files:
            - path: .
              image:
                url: ghcr.io/educates/educates-extension-packages/vscode-java-tools-oci-overlay:v0.29.2
    ...
```

You can verify that the Extension is installed by looking at the extensions in the Editor:

```dashboard:open-dashboard
name: Editor
```

Now click on the VS Code extensions tab.
