
---
title: Getting Started – Git in Your Environment
---

Now that you’ve been introduced to Git and its core concepts, let’s take the first practical step by getting comfortable with the Git environment.

You’re working in a web terminal that already has Git installed. So, instead of installing Git, let’s focus on verifying the installation and checking some basic configuration.

First, confirm that Git is available:

```execute
git --version
```
You should see an output like:

```
git version 2.39.3
```
This confirms that Git is installed and ready to use in your environment.

### Configure Git (One-time Setup) ###
Before making your first commit, it’s best to tell Git who you are. Git includes your name and email address in each commit you make. This helps with collaboration and tracking history.

Run the following to set up your Git identity:
```execute
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```
To check your configuration settings, use:
```
git config --list
```
You’ll see something like:
```
user.name=Your Name
user.email=you@example.com
```
> The `--global` flag means these settings will apply to all projects you work on in this environment. You can override them for individual projects later if needed.

### Create Your First Git Project ###
Let’s now create a simple project folder that you can start tracking with Git.

```execute
mkdir catgram
cd catgram
```
Initialize an empty Git repository in this folder:
```execute
git init
```
You should see:
```
Initialized empty Git repository in /root/catgram/.git/
```
This means Git is now tracking this folder.
Let’s check the status of the repository:
```execute
git status
```
You’ll see something like:
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

Congratulations — you now have Git configured and a project ready to go! In the next module, we’ll explore how to make your first commit.
```
If you’re ever unsure about what a Git command does, you can always check the help with:
```execute
git help <command>
```
Example:
```execute
git help config
```
```




