#!/usr/bin/env bash
# cdk-deploy-to-lobs.sh
./cdk-deploy-to.sh <lob1-account> us-east-1 --profile lob1 "$@" || exit
./cdk-deploy-to.sh <lob2-account> us-east-1 --profile lob2 "$@"
