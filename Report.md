# Interactive workshops for IT training

[TOC]

## 1. Introduction

- Organizations offering practical IT training aim to ensure and assess trainees' understanding of a technical topic.

- Training materials are typically offered in the form of tutorial documents and may contain additional elements such as diagrams, screenshots, or blocks of code.

- Introducing interactive elements (e.g., buttons, input fields, checker scripts, runnable code blocks, hyperlinks, animations, etc.) to the learning process is believed to create a more engaging and fun experience for the learner.
  - Moreover, refactoring a long guide into smaller manageable steps (i.e., byte-sized lessons) gives learners a sense of accomplishment that encourages them to keep going and finish their lesson.
  - One may also include a competitive element or small quizzes and/or interactive checks to assess understanding and ability to apply learned concepts.

- Interactive byte-sized lessons are not a new idea, they are actively being used by many successful **commercial** products, below we provide some popular examples.

  | Product   | Focus                                       | Means                       |
  | --------- | ------------------------------------------- | --------------------------- |
  | SoloLearn | Learning a Programming Language             | Quizzes and Code Playground |
  | Stepik    | Coding and Problem Solving                  | Online Judge                |
  | Brilliant | Various Math/Science topics                 | Interactive Animations      |
  | Duolingo  | Language Learning (recently Math and Music) | Gamification and Repetition |

- To conclude, utilizing the interactive approach for IT training and assessment is getting increasingly more popular due to its effectiveness.

## 2. Methodology

To design an effective IT training training/testing platform, one needs to utilize different systems based on the practical topic being taught.

| Field / Skill     | Approach              | Explanation                                                  | Most Popular FOSS Solution for Self-Hosting |
| ----------------- | --------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Coding            | Online Judge          | Systems that automatically run user-submitted code in isolation to evaluate it | [CMS](https://cms-dev.github.io/)           |
| Data Science      | Interactive Notebooks | Notebooks incorporating styled text (MD, LaTeX, HTML) with runnable code snippets and output visualization. | [JupyerLab](https://jupyter.org/)           |
| Cybersecurity     | Jeopardy CTFs         | Challenges requiring security knowledge to extract secrets from vulnerable artifacts or systems with simpler checkers for validation. | [CTFd](https://ctfd.io/)                    |
| Computer Networks | Network Simulators    | Running virtualized hosts and network appliances to simulate a lab environment | [GNS3](https://github.com/GNS3)             |
| SysAdmin / DevOps | Interactive Labs      | A split-screen layout: workshop instructions on the left and "practice playground" on the right. | ???                                         |

Solutions above were proven to be effective in helping learners develop hands-on skills in the target area.

### 2.1. Project Focus

**Focus:** workshops on interaction with a running system/service or learning about a new technology.

**Scope:** topics revolving around system administration, infrastructure/DevOps, and Cybersecurity

- Tutorials on CLI tools (e.g., git, docker, ansible, etc.).
- Learning to interact with and troubleshoot a running service (e.g., a database or web server).
- Getting started with a new technology (let users go through proof-of-concept demos).

**Goals**:

- (Must-have) providing effective means for an instructor to ensure that participants obtain real skills in a practical and engaging format.
- (Nice-to-have) Simplify the auditing/checking process for the instructor.

### 2.2. Relevant Projects

It's not wise for a small team to rush and start building their own solution without prior research for existing ones. Below we list explored projects and products that are relevant to our focus.

#### 2.2.1. Closed-Source Solutions/Services

Projects listed below provide valuable content, but an educator cannot not self-host them or include their own materials (unless stated otherwise). Access to the servers is often paywalled to cover server costs.

| Product                                                      | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [KillerCoda](https://killercoda.com)                         | Alternative to [Katacoda](https://www.katacoda.com/): authors create interactive lessons in Markdown, with JSON for configuring interactive elements (code blocks, checkers, runnable commands). Platform itself is not open-sourced, but [scenarios](https://github.com/killercoda/) can be. |
| [RHCSA.guru](https://rhcsa.guru)                             | Interactive platform to practice Red Hat system administration to prepare for certification. Includes embedded terminal and IDE with occasional interactive bash checkers to verify learner's activity. |
| [KodeKloud](https://kodekloud.com/free-labs/)                | Offering interactive labs for DevOps training                |
| [Iximiuz Labs](https://labs.iximiuz.com/challenges)          | DevOps / Server-side challenges with embedded terminal and automatic checkers |
| [OverTheWire Wargames](https://overthewire.org/wargames/)    | Gamified security challenges on advancing through machines (levels) over SSH |
| [TryHackMe Labs](https://tryhackme.com/room/linuxfundamentalspart1) | Guided labs with text-based questions for verification       |
| [HackerRank DevOps Assessments](https://www.hackerrank.com/blog/assess-devops-skills-interviews/) | Service for companies to assess DevOps candidates for hiring, provides challenges and bash checks. |
| [Educative.io](https://educative.io)                         | Offering scenario-based lessons with embedded terminals for experimentation. |
| [Vocareum Labs](https://www.vocareum.com/)                   | Platform used by AWS Academy to run pre-configured cloud labs alongside a Markdown lab guide document. |
| [Strigo.io](https://strigo.io)                               | Enterprise solution offering interactive IT training labs    |
| [Packet Tracer Labs](https://learningnetwork.cisco.com/s/article/packet-tracer-labs) | Network Labs with auto checking for Cisco equipment.         |

#### 2.2.2. Open-Source Projects

| Project                                                      | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [SadServers](https://github.com/SadServers/sadservers/)      | Provides servers with pre-configured scenarios on fixing, doing, or hacking systems. Includes bash checkers for validation. |
| [LinuxZoo](https://linuxzoo.net/)                            | Limited set of tutorials with machines for experimentation and auto checkers. |
| [OWASP SKF ](https://skf.gitbook.io/asvs-write-ups/)/ [VulnHub](https://www.vulnhub.com/) | Containerized / Virtualized vulnerable apps for security training |
| [Shutit](https://github.com/ianmiell/shutit)                 | Automation framework to run pre-configured scenarios from terminal |
| [Kathara](http://github.com/katharaFramework/Kathara-Labs/) ([checker](https://github.com/KatharaFramework/kathara-lab-checker)) | Lightweight containerized network labs                       |
| [HobbyFarm.io](https://hobbyfarm.github.io/hobbyfarm/)       | Solution for running cloud labs for events                   |
| [Educates.dev](https://educates.dev/)                        | A system for hosting interactive workshop environments       |

## 3. Results

### 3.1. Explored Solutions

- Both [HobbyFarm.io](https://hobbyfarm.github.io/hobbyfarm/) and [Educates.dev](https://educates.dev) were good candidates to fill the gap in Table 2 (FOSS solution for self-hosted customizable lab environments). Below we conduct a brief comparison.

  |                       | Educates                                                     | HobbyFarm                                                    |
  | --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | Developers            | VMWare (Broadcom)                                            | Rancher Labs (SUSE)                                          |
  | Initial Goal          | Internal training platform                                   | Showcasing new tech during events                            |
  | Workshop env.         | K8s pods running Fedora Linux                                | Cloud VMs (DigitalOcean / AWS)                               |
  | Workshop artifact     | OCI image with lab files                                     | VM templates with cloud-config                               |
  | Workshop instructions | Extended Markdown [[ref.](https://docs.educates.dev/en/stable/workshop-content/workshop-instructions.html)] | Extended Markdown [[ref.](https://hobbyfarm.github.io/docs/appendix/markdown_syntax/)] |
  | Unique feature        | Integrated applications (see below)                          | Running multiple VMs                                         |
  | Quizzing users        | Examiner scripts                                             | Checkbox / Radio quizzes                                     |

- HobbyFarm Interface

  ![image-20250722190230358](https://i.imgur.com/V6wnOzu.png)

- Educates Interface

  ![img](https://educates.dev/img/description/01-dashboard-terminal.png)

### 3.2. Our Contribution

While exploring tools, we faced three main inconveniences:

1. Deploying and maintaining either platform is not a trivial task
   - It requires significant computational resources and technical skills.

2. Both tools are tightly integrated with K8s ecosystem

   - Educates docs only specified K8s deployment option (in K3s, Minikube, or AWS/GCP)

   - HobbyFarm is a cloud-native solution, offering a Helm chart as the main deployment option.

3. It's not easy for an instructor to observe student actions
   - They need to `exec` into the student pod (Educates) or SSH into their VM (HobbyFarm) to see command history or check server state.

To counter the issues, we decided to **proceed with educates** with the following modifications:

- Strip-away the K8s components, allowing a lab to be executed in docker locally on a student's machine.
- Rebuild an alternative lab environment based on `ubuntu:24.04` unminified image
- Write scripts to automatically:
  1. Prompt for student's username
  2. Record the sessions as they start the lab
  3. Run the custom dev environment
    - It has direct access to the host's networking capabilities
    - It's preconfigured with an opinionated setup ([fish](https://fishshell.com/) in [Zellij](https://zellij.dev/)) and basic toolset
  4. Once finished, session can be uploaded to [asciinema.org](https://asciinema.org) for the instructor to review.

## 4. Discussion

### 4.1. Limitations

Limitations mostly revolve around the use of educates for assessment and class management. The platform was not designed for this purpose, yet there is potential for adding more assessment elements.

1. Educates examiner helps to automatically evaluate learner's work, but cannot natively report the results.
1. Writing examiner scripts takes time and not every task can be automatically and reliably checked
1. Educates does not contain any class management tools
1. Porting existing tutorial content to the extended markdown syntax used by educates is a tedious process.

### 4.2. Future Directions

To cope with the above limitations, one can proceed with the following actions:

1. Write scripts to automate reporting student work externally (e.g., using webhooks)
1. Utilize LLMs to accelerate creating tasks and checkers.
1. Integrate educates and other tools from Table 2 into a unified LMS for IT universities.
1. Research ways to automate the refactoring of existing tutorials materials to add the interactive elements.
