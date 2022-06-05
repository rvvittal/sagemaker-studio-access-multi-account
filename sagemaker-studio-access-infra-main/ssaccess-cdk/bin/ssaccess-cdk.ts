#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SsaccessCdkStack } from '../lib/ssaccess-cdk-stack';


const app = new cdk.App();

new SsaccessCdkStack(app, 'SsaccessCdkStackLob');
