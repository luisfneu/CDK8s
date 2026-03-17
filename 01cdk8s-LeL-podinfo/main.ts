import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { KubeDeployment, KubeService, IntOrString  } from './imports/k8s';

export class Core extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id, { namespace: 'cdk8s' });
    const label = { app: 'podinfo-k8s' };

    new KubeService(this, 'service', {
      spec: {
        type: 'LoadBalancer',
        ports: [ { port: 81, targetPort: IntOrString.fromNumber(9898) } ],
        selector: label
      }
    });

    new KubeDeployment(this, 'deployment', {
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'podinfo-kubernetes',
                image: 'stefanprodan/podinfo:6.11.1',
                ports: [ { containerPort: 9898 } ]
              }
            ]
          }
        }
      }
    });
  }
}

const app = new App();
new Core(app, 'podinfo');
app.synth();