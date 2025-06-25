#!/bin/bash

if [ ! -f $HOME/bin/vcluster ]; then
    ln -s vcluster-linux-amd64 $HOME/bin/vcluster
fi

chmod +x $HOME/bin/vcluster-linux-amd64
