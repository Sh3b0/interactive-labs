---
title: Workshop instructions
---

You can execute actions directly on yout integrated editor:

You can view the installed extensions:

```editor:execute-command
command: workbench.view.extensions
```

Or install an extension:

```editor:execute-command
command: workbench.extensions.installExtension
args:
- ms-python.python
```

Or execute any other action supported by VS Code or the Educates VS Code plugin.

To open an existing file you can use:

```editor:open-file
file: ~/resources/workshop.yaml
```

You can highlight certain lines of a file based on an exact string match, use:

```editor:select-matching-text
file: ~/resources/workshop.yaml
text: "medium"
```

Or highlight some specific linesbefore and after the text.

```editor:select-matching-text
file: ~/resources/workshop.yaml
text: "medium"
before: 1
after: 1
```

There's many actions that can be performed with the embedded VS Code Editor. 
Check the [Educates documentation](https://docs.educates.dev) for more