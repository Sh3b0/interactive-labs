#!/bin/bash
if [ ! -f /root/logs ] || [ ! -f /tmp/log_archive.tgz ]; then
    exit 1
fi
if grep -qv "ACPI" /root/logs; then
    exit 1
fi
if ! tar tf /tmp/log_archive.tgz | grep -qm1 'var/log'; then
    exit 1
fi
exit 0
