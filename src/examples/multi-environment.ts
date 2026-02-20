#!/usr/bin/env node
import { App } from 'cdk8s';
import { WebAppChart } from '../charts/webapp-chart';
import { getEnvironmentConfig } from '../config/environments';

const app = new App();

const envName = (process.env.ENV || 'dev') as 'development' | 'stg'  as 'staging' | 'prod'  as 'production';
const config = getEnvironmentConfig(envName);

new WebAppChart(app, `webapp-${envName}`, {
  namespace: config.namespace,
  appName: 'webapp',
  replicas: config.replicas,
  image: 'nginx:1.25',
  port: 80,
  env: {
    ...config.env,
    ENVIRONMENT: envName,
  },
  resources: config.resources,
});

new WebAppChart(app, `api-${envName}`, {
  namespace: config.namespace,
  appName: 'api',
  replicas: config.replicas,
  image: 'node:18-alpine',
  port: 3000,
  env: {
    ...config.env,
    ENVIRONMENT: envName,
    PORT: '3000',
  },
  resources: {
    cpu: {
      request: String(parseInt(config.resources.cpu.request) * 2),
      limit: String(parseInt(config.resources.cpu.limit) * 2),
    },
    memory: config.resources.memory,
  },
});

app.synth();
