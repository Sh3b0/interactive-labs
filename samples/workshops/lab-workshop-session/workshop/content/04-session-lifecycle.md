---
title: Session Lifecycle
---

The duration of training workshops would normally be time limited. This duration
can be fixed, or requests for time extensions up to a maximum can be enabled. An
inactivity timeout can be specified so that workshop sessions are automatically
cleaned up before the workshop duration is reached, in the event the workshop
user closes out the browser session without terminating the workshop session.

A training portal can specify a maximum on the number of concurrent sessions
allowed across all workshops hosted via that training portal instance. A
separate lower fixed capacity can also be specified on a per workshop basis to
deal with cases where some workshops require more resources than others. These
restrictions would be used to control the number of active workshop sessions and
avoid running out of resources in the Kubernetes cluster.

Workshop sessions can be created on demand, or it can be specified that a
certain number of workshop sessions for a workshop are created and kept ready
for allocation to a workshop user. Reserved sessions avoid the need for users to
wait when there is a noticeable startup time for resources created for a
specific workshop.
