# Recordings

The environment automatically records all terminal sessions of the learner and places them in this directory.

Generated recordings are owned by `1001:1001` (`dev` user from terminal container). Change permissions if needed with

    ```bash
    sudo chown $(id -u):$(id -g) *.cast
    ```
