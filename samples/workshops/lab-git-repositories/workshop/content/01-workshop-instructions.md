---
title: Workshop instructions
---

When the embedded Git server is enabled, you can directly use it. Let's clone
an empty project:

```bash
git clone $GIT_PROTOCOL://$GIT_HOST/project.git
```

Now that we have cloned that empty project, let's add some files to it:

```bash
cd project
```

Let's create some text file:

```bash
date > date.txt
```

Now, we will add the file to our project:

```bash
git add .
```

Let's commit the changes:

```bash
git commit -m "Initial files."
```

And push them to our repository:

```bash
git push
```

You will notice in the output the full url of your repository. This can be accessed
externally if desired.

If you want to pre-create one or more source code repositories on the Git server, 
this can be done from a workshop setup.d script as part of your workshop content:

```yaml
#!/bin/bash

set -eo pipefail
set -x

cd /opt/git/repositories

git clone --bare https://github.com/example/project.git
```

This feature is very handy when as part of your workshop you want to show the usage of Git.

**NOTE** This Git server is per workshop session, so once the session is terminated, the Git
server along with all the contents will be deleted.

If you want a longer term solution, use an Environment or Managed/Hosted Git Server.