#!/usr/bin/fish

set -Ux fish_greeting ""

# Vars for regular container (with docker socket bind-mounts). Also executes in sysbox container, but errors are ignored there
if test -f /.dockerenv
    alias docker='sudo docker'
    set -Ux HOST_WORKDIR "$(docker inspect labenv 2>/dev/null | jq -r '.[0].Mounts[] | select(.Destination=="/home/ubuntu") | .Source' 2>/dev/null)"
    set -Ux HOST_USERNAME "$(docker system info --format '{{.Name}}')"
    set -Ux NETWORK_GATEWAY "$(docker inspect lab_net 2>/dev/null | jq -r '.[0].IPAM.Config[0].Gateway' 2>/dev/null)"
end

while true
    read -P 'Enter your username: ' username
    if test -n "$username"
        break
    end
end

# If zellij and asciinema are available, start recording session. Otherwise, just start fish
if type zellij && type asciinema 2>/dev/null
    mkdir -p recordings

    while true
        set DATE_TIME $(TZ=Europe/Moscow date '+%Y-%m-%d_%H-%M-%S')
        asciinema rec -i 1 "recordings/$DATE_TIME.cast" -c "zellij attach -c $username"
        read -P 'Recording finished. Press Enter to start a new session. ' restart
    end

else
    exec fish
end
