# SageMaker Presigned

## Prerequisites for the Solution

## Deploy the Solution
* Deploy the SAM template
  * `sam build`
  * `sam deploy --guided`
    * This stage will prompt you to enter the required parameters, including SageMaker domain ID and API-Gateway stage
    * If you already have an API Gateway VPC endpoint, enter the endpoint ID.  Otherwise, leave the parameter blank and one will be created for you

## Configure the Cognito User
After you have deployed the SAM template, you will need to configure Cognito to match the SageMaker user profile.
* Create a Cognito User with the same name as a SageMaker user profile
  * `aws cognito-idp admin-create-user --user-pool-id <user_pool_id> --username <sagemaker_username>`
* Set the User Password
  * `aws cognito-idp admin-set-user-password --user-pool-id <user_pool_id> --username <sagemaker_username> --password <password> --permanent`
* Get an access token
  * `aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id <cognito_app_client_id> --auth-parameters USERNAME=<sagemaker_username>,PASSWORD=<password>`

## Test the connection
* Open up Postman and add the Access Token to your Authorization Header
  * `Authorization: Bearer <access token>`
* Modify the API Gateway URL to hit it from your internal EC2 instance
  * Add the VPCE into your API-Gateway URL
    * `https://<API-Gateway-ID>-<VPCE-ID>.execute-api.<REGION>.amazonaws.com/dev/EMPLOYEE_ID`
  * Add the `Host` Header with a value of your API-Gateway URL 
    * `<API-G-ID>.execute-api.<REGION>.amazonaws.com`
  * Change the EMPLOYEE_ID to your Cognito user / SageMaker user profile name and ensure you receive an `Authorized URL`
  *   Change the EMPLOYEE_ID to a user that isn't yours and ensure you receive an access failure

  ## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
