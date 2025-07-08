# Collection of Resources

## For "Borrowing" content

- <https://labs.iximiuz.com/challenges>
- <https://kodekloud.com/free-labs/linux/>
- <http://sadservers.com/>
- <https://secureby.design/labs>
- <https://overthewire.org/wargames/>
- <https://linuxupskillchallenge.org/01/>
- <https://linuxzoo.net/>
- <https://killercoda.com/>

## For Deployment/Grading

- <https://github.com/educates/educates-training-platform>
- <https://github.com/CTFd/CTFd?tab=readme-ov-file>
- <https://asciinema.org/>
- <https://classroom.github.com/login>
- <https://github.com/huashengdun/webssh>
- <https://github.com/overhangio/tutor?tab=readme-ov-file>
  - <https://github.com/openedx/codejail?tab=readme-ov-file#installation>
  - <https://github.com/openedx/XBlock>
- <https://labs.play-with-docker.com/>
- <https://webvm.io>
- <https://github.com/educates/educates-training-platform>
- <https://hobbyfarm.github.io/hobbyfarm/>

## Automation categories

- **Programming courses?**
  - Done and easy enough through online judges (e.g., CodeForces, Stepik)

- **Databases-related courses?**
  - SQL exercises are also treated like problem solving
  - No-SQL dbs: their deployment and config lies under sysadmin category down there.
- **Data Science?**
  - Not much experience, but interactive notebooks shows process & results
- **Syadmin, DevOps**, **Networks**, and **Security**
  - Still facing issues. Let's break it down and focus on one thing at a time.
- A bit of automation & fun for:
  - Security courses: through CTFs.
    - Issue of verifying integrity and prevent flag-sharing.
  - Networks courses: automatically graded labs in Packet Tracer.
    - Issue: quite limited to packet tracer and cisco equipment
    - Question: is it possible to haver autograded gns labs?
  - Sysadmin/DevOps courses: scenario-based labs
    - Issue: writing bash checkers is difficult and error-prone
    - Question: is there a solution to self-host that?
    - Hmm? Possiblity of using jupyterlab terminal?

## Free Solutions For Self-Hosting

- GitHub Classroom (Runner Server)
  - Best option so far for class management, grading, and reporting features
  - Difficult to carry out non-coding tasks
- JupyterLab Server
  - Issues with access control
  - Issues with autograding/reporting
  - Difficult to carry out non-coding tasks
- CTFd
  - Good for competition and grading
  - Only for specific types of exercises
  - Need mechanisms to ensure honesty (e.g., asciicinema)
- Educates
  - Mainly for guided workshops, difficult to integrate grading elements
  - Can include grader.sh scripts and/or their binaries
  - Need to think about personalization of tasks and reporting format (e.g., asciicinema)
    1. Student logs in to platform: seen list of exercises
    1. Select an exercise: gets a description+terminal running our image
    1. Image is configured to:
       - Ask about email? student enters 'i.ivanov'
       - Creates a user/hostname (prompt)
       - Starts asciicinema recording
       - Play time
       - After finishing, student is asked to run checker.sh

- Packet Tracer / GNS3 Labs
