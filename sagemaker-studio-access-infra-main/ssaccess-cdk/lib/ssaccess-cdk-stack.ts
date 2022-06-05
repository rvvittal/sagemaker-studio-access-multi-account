import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cfninc from 'aws-cdk-lib/cloudformation-include';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SsaccessCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'SsaccessCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
// Create new VPC with 2 Subnets
const vpc = new ec2.Vpc(this, 'VPC', {
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'ingress',
      subnetType: ec2.SubnetType.PUBLIC,
    },
    {
      cidrMask: 24,
      name: 'application',
      subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    }
  ],
  maxAzs: 2
});

// create vpc security group

const vpcSecurityGroup = new ec2.SecurityGroup(this, 'VPCSecurityGroup', {
  vpc,
  description: 'Allow tcp traffic self-ref',
  allowAllOutbound: true
});
vpcSecurityGroup.addIngressRule(vpcSecurityGroup, ec2.Port.allTcp(), 'self-ref');


// create vpc endpoint sec group

const vpcepSecurityGroup = new ec2.SecurityGroup(this, 'VPCEPSecurityGroup', {
  vpc,
  description: 'Allow https from vpc sg',
  allowAllOutbound: true
});
vpcepSecurityGroup.addIngressRule(vpcSecurityGroup, ec2.Port.tcp(443), 'https from vpc sg');

const region = String(process.env.CDK_DEFAULT_REGION)

// create sm api vpce

new ec2.InterfaceVpcEndpoint(this, 'SM API VPC Endpoint', {
  vpc,
  service: new ec2.InterfaceVpcEndpointService('com.amazonaws.' +region +'.sagemaker.api', 443),
  privateDnsEnabled: true,
  // Choose which availability zones to place the VPC endpoint in, based on
  // available AZs
});

//create studio vpce

new ec2.InterfaceVpcEndpoint(this, 'Studio VPC Endpoint', {
  vpc,
  service: new ec2.InterfaceVpcEndpointService('aws.sagemaker.' + region + '.studio', 443),
  privateDnsEnabled: true,
  // Choose which availability zones to place the VPC endpoint in, based on
  // available AZs
});

//create sagemaker role for studio users

const vpcPrivateSubnetsId = vpc.selectSubnets({subnetType: ec2.SubnetType.PRIVATE_WITH_NAT}).subnetIds;

const smrole = new iam.Role(this, 'RoleForSagemakerStudioUsers', {
  assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
  roleName: "RoleSagemakerStudioUsers",
  managedPolicies: [
    iam.ManagedPolicy.fromManagedPolicyArn(this, 'smreadaccess',  "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess")
                                          
  ]
})

const smDomain = new cfninc.CfnInclude(this, 'SagemakerDomainTemplate', {
  templateFile: 'lib/sagemaker-domain-template.yaml',
  preserveLogicalIds: false,
  parameters: {
    "auth_mode": "IAM",
    "domain_name": 'mySagemakerStudioDomain',
    "vpc_id": vpc.vpcId,
    "subnet_ids": vpcPrivateSubnetsId,
    "default_execution_role_user": smrole.roleArn,
    "app_net_access_type":  'VpcOnly'
  },
});

const sagemaker_domain_id = smDomain.getResource('SagemakerDomainCDK').ref

console.log(sagemaker_domain_id);

const smUser = new cfninc.CfnInclude(this, 'SagemakerUserTemplate', {
  templateFile: 'lib/sagemaker-user-template.yaml',
  preserveLogicalIds: false,
  parameters: {
    "sagemaker_domain_id": sagemaker_domain_id,
    "user_profile_name": 'sm-studio-user',
    "execution_role_user": smrole.roleArn,
    "security_group":  [vpcSecurityGroup.securityGroupId] 
    
  },
});





  }

}