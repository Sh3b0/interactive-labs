# Educates Workshop

Demo on integrating asciicinema with educates to record student sessions.

1. Install Educates CLI

    ```bash
    cd /usr/local/bin
    curl -o educates -sL https://github.com/educates/educates-training-platform/releases/latest/download/educates-linux-amd64
    chmod +x educates
    ```

2. Customize `resources/workshop.yaml` as needed
    - `spec.image`: base lab image
    - `spec.publish.image`: where to publish the image with lab files
    - `spec.workshop.files[*].image`: where to grab the image with lab files (to be overlayed on top of base image)

3. Test workshop locally

    ```bash
    cd <workshop-dir>
    educates docker workshop deploy --host=127.0.0.1 --port=8080
    ```

4. Use GH [action](.github/workflows/publish.yaml) to publish lab files to GHCR or do it manually.

    ```bash
    cd <workshop-dir>
    export CR_PAT= # Token with write:package permissions
    echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
    educates publish-workshop
    ```
