---
title: Clickable Actions
---

Workshop instructions can be scripted with the details of commands a user should
execute in the terminals. These can be displayed as code blocks, with the user
required to manually type in each command:

```
date
```

To avoid mistakes made when users manually enter commands, commands can instead
be annotated such that clicking on them performs an action. In the simplest case
this might result in text being copied to the system paste buffer when clicked
so it can be pasted to another window:

```workshop:copy
text: date
```

Alternatively, clicking on the instruction can result in the command being run
for the user in the appropriate terminal.

```terminal:execute
command: date
session: 1
```

```terminal:execute
command: date
session: 2
```

If you didn't click on any of the above commands, do so now to see what occurs.

Clicking on actions will update the visible appearance so a user knows what
steps have already been completed.

Clickable actions are available for a range of purposes including interacting
with tabs on the right hand side of the workshop dashboard.

```dashboard:open-dashboard
name: Docs
```

This could be used for example to ensure users are always looking where they
need to be, or additional tabs for various purposes might be created on demand
and the user switched to that tab.

Instructions or commands can where necessary be automatically filled out with
data values unique to a workshop session so that everything is customized for
the specific workshop user.
