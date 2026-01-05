import { App } from 'cdk8s';
import { NginxChart } from './nginx-chart';

const app = new App();
new NginxChart(app, 'nginx');
app.synth();
