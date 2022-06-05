import boto3
import json
import os

SAGEMAKER_DOMAIN_ID = os.environ['SAGEMAKER_DOMAIN_ID']
REGION = os.environ['REGION']

def lambda_handler(event, context):
    client = boto3.client('sagemaker', region_name=REGION)

    try:
        user_profile = 'fakeprofile'
        print(event['path'])
        user_profile = (event['path'].replace('/', ''))
        print(user_profile)

        response = client.create_presigned_domain_url(
            DomainId=SAGEMAKER_DOMAIN_ID,
            UserProfileName=user_profile,
            SessionExpirationDurationInSeconds=43200,
            ExpiresInSeconds=60
        )
    except Exception as e:
        response = {"error": str(e)}

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(response)
    }
