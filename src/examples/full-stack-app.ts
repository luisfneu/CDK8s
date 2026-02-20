#!/usr/bin/env node
import { App } from 'cdk8s';
import { WebAppChart } from '../charts/webapp-chart';
import { DatabaseChart } from '../charts/database-chart';


const app = new App();

new DatabaseChart(app, 'mysql-db', {
  namespace: 'poc',
  dbName: 'mysql',
  image: 'mysql:8.0',
  port: 3306,
  storageSize: '20Gi',
  rootPassword: '', 
});

// API Backend
new WebAppChart(app, 'api-backend', {
  namespace: 'poc',
  appName: 'api',
  replicas: 3,
  image: 'my-api:v1.0.0',
  port: 3000,
  env: {
    'NODE_ENV': 'poc',
    'DB_HOST': 'localhost',
    'DB_PORT': '3306',
  },
  resources: {
    cpu: {
      request: '200',
      limit: '500',
    },
    memory: {
      request: '256',
      limit: '512',
    },
  },
});

new WebAppChart(app, 'frontend', {
  namespace: 'poc',
  appName: 'frontend',
  replicas: 2,
  image: 'my-frontend:v1.0.0',
  port: 80,
  env: {
    'API_URL': 'localhost:3000',
  },
  resources: {
    cpu: {
      request: '100',
      limit: '200',
    },
    memory: {
      request: '128',
      limit: '256',
    },
  },
});

app.synth();
