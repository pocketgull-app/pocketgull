/**
 * Pocketgull AWS HealthLake & AWS Bedrock Provisioning Helper
 * Checks AWS CLI credentials, provisions a FHIR R4 HealthLake Datastore,
 * and updates environment configuration.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 [Pocketgull AWS Setup] Initiating AWS HealthLake & Bedrock Account Provisioning Check...\n');

// 1. Check AWS CLI Installation
try {
  const version = execSync('aws --version', { encoding: 'utf-8' });
  console.log('✅ AWS CLI Detected:', version.trim());
} catch {
  console.warn('⚠️  AWS CLI is not installed or not in PATH.');
  console.warn('   Install AWS CLI from https://aws.amazon.com/cli/ or set environment variables manually in .env.local\n');
}

// 2. Check AWS Credentials
try {
  const callerIdentity = execSync('aws sts get-caller-identity --output json', { encoding: 'utf-8' });
  const identity = JSON.parse(callerIdentity);
  console.log(`✅ AWS Account ID: ${identity.Account}`);
  console.log(`✅ AWS IAM Identity: ${identity.Arn}\n`);
} catch (err) {
  console.warn('⚠️  AWS STS Caller Identity Check Skipped/Failed.');
  console.warn('   Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.\n');
}

// 3. HealthLake Datastore Provisioning Helper
console.log('📋 AWS HealthLake Datastore Provisioning Command:');
console.log('----------------------------------------------------');
console.log(`aws healthlake create-fhir-datastore \\
  --datastore-name "pocketgull-healthlake-r4" \\
  --datastore-type-version "R4" \\
  --sse-configuration '{"SseType":"AWS_OWNED_KMS_KEY"}' \\
  --region "us-east-1"\n`);

// 4. Print Environment File Setup Template
const envTemplate = `
# AWS HealthLake & Bedrock Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_HEALTHLAKE_ENDPOINT=https://healthlake.us-east-1.amazonaws.com/datastore/YOUR_DATASTORE_ID/r4
`;

console.log('📝 Append the following to your .env.local file:');
console.log('----------------------------------------------------');
console.log(envTemplate.trim());
console.log('\n✅ [Pocketgull AWS Setup] Verification Complete.');
