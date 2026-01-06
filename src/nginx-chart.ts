import { Chart } from 'cdk8s';
import { Construct } from 'constructs';
import { KubeDeployment, KubeService } from 'cdk8s-plus-32';

export class NginxChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new KubeDeployment(this, 'nginx-deploy', {
      spec: {
        replicas: 2,
        selector: {
          matchLabels: { app: 'nginx' }
        },
        template: {
          metadata: {
            labels: { app: 'nginx' }
          },
          spec: {
            containers: [{
              name: 'nginx',
              image: 'nginx:latest',
              ports: [{ containerPort: 80 }]
            }]
          }
        }
      }
    });

    new KubeService(this, 'nginx-svc', {
      spec: {
        type: 'ClusterIP',
        selector: { app: 'nginx' },
        ports: [{ port: 80, targetPort: 80 }]
      }
    });
  }
}
