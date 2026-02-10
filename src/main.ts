#!/usr/bin/env node
import { App } from 'cdk8s';
import { WebAppChart } from './charts/webapp-chart';

const app = new App();

new WebAppChart(app, 'webapp', {
  namespace: 'default',
  appName: 'my-webapp',
  replicas: 3,
  image: 'nginx:1.25',
  port: 80,
});

app.synth();
