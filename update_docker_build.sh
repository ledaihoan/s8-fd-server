#!/usr/bin/env bash
DOCKER_IMAGE_NAME=s8-fd-server
DOCKER_AUTHOR_NAME=ledaihoan

is_version_string() {
    [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

docker build -t $DOCKER_IMAGE_NAME .

if is_version_string "$1"; then
    VERSION="$1"
    echo "Executing docker commands with version: $VERSION"

    # Docker commands using the version
    docker tag $DOCKER_IMAGE_NAME $DOCKER_AUTHOR_NAME/$DOCKER_IMAGE_NAME:$VERSION
    docker push $DOCKER_AUTHOR_NAME/$DOCKER_IMAGE_NAME:$VERSION

elif [ -n "$1" ]; then
    echo "Usage: $0 <VERSION>"
    echo "VERSION should be in x.y.z format. If version not provide, only rebuild local image"
    exit 1
else
    echo "As no VERSION provided, the script only rebuild local image"
fi