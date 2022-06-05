#!/usr/bin/env bash
# cdk-deploy-to-lobs.sh
./cdk-deploy-to.sh 368766719129 us-east-1 --profile lob1 "$@" || exit
./cdk-deploy-to.sh 145102640261 us-east-1 --profile lob2 "$@"