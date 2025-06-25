---
title: Building the application
---

We are now ready to build the application source code. We will first do this direct into the local directory.

Change to the `demo` sub directory.

```terminal:execute
command: cd ~/exercises/demo
```

Then run Maven to start the build.

```terminal:execute
command: ./mvnw install
```

> NOTE: It can take a couple of minutes the first time, but once the dependencies are all cached, subsequent builds would be faster.

When the build has completed, build artefacts including the application JAR file, can be found in the `target` sub directory.

```terminal:execute
command: tree target
```

To test that the application works, run Java with the application JAR file:

```terminal:execute
command: java -jar target/*.jar
```
