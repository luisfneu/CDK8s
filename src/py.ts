import { Chart } from 'cdk8s';
import { Construct } from 'constructs';
import { KubeDeployment, KubeService } from 'cdk8s-plus-32';

export class CalcApiChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new KubeDeployment(this, 'calc-api-deploy', {
      spec: {
        replicas: 2,
        selector: { matchLabels: { app: 'calc-api' } },
        template: {
          metadata: { labels: { app: 'calc-api' } },
          spec: {
            containers: [
              {
                name: 'calc-api',
                image: 'ghcr.io/seu-org/calc-api:1.0.0',
                ports: [{ containerPort: 5000 }],
                readinessProbe: {
                  httpGet: { path: '/health', port: 5000 },
                  initialDelaySeconds: 5,
                  periodSeconds: 5
                },
                livenessProbe: {
                  httpGet: { path: '/health', port: 5000 },
                  initialDelaySeconds: 10,
                  periodSeconds: 10
                }
              }
            ]
          }
        }
      }
    });

    new KubeService(this, 'calc-api-svc', {
      spec: {
        type: 'ClusterIP',
        selector: { app: 'calc-api' },
        ports: [{ port: 80, targetPort: 5000 }]
      }
    });
  }
}
