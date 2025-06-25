---
title: Running JupyterLab
---

In order to have JupyterLab run, it must be enabled in your workshop definition, and an ingress and dashboard configured.

Add this to your workshop definition file:

```yaml
apiVersion: training.educates.dev/v1beta1
kind: Workshop
metadata:
  name: lab-jupyter-workshop
spec:
  session:
    ...
    env:
      - name: ENABLE_JUPYTERLAB
        value: "true"
    ingresses:
      - name: jupyterlab
        port: 8888
    dashboards:
      - name: JupyterLab
        url: "$(ingress_protocol)://$(session_namespace)-jupyterlab.$(ingress_domain)/
```      

The default password for JupyterLabs is `jupyter`

You can see it in action by:

```dashboard:open-dashboard
name: JupyterLab
```

**Note** that JupyterLab doesn't need to be enabled if you don't want to use it
in your workshop, but only use **conda**. 
