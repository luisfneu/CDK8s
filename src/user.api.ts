import { Chart } from 'cdk8s';
import { Construct } from 'constructs';
import { KubeDeployment, KubeService } from 'cdk8s-plus-32';

export class UsersApiChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new KubeDeployment(this, 'users-api-deploy', {
      spec: {
        replicas: 3,
        selector: {
          matchLabels: { app: 'users-api' }
        },
        template: {
          metadata: {
            labels: { app: 'users-api' }
          },
          spec: {
            containers: [
              {
                name: 'users-api',
                image: 'ghcr.io/seu-org/users-api:1.0.0',
                ports: [{ containerPort: 3000 }],
                env: [
                  { name: 'NODE_ENV', value: 'production' },
                  { name: 'SERVICE_NAME', value: 'users-api' }
                ],
                readinessProbe: {
                  httpGet: { path: '/health', port: 3000 },
                  initialDelaySeconds: 10,
                  periodSeconds: 5
                },
                livenessProbe: {
                  httpGet: { path: '/health', port: 3000 },
                  initialDelaySeconds: 20,
                  periodSeconds: 10
                },
                resources: {
                  requests: {
                    cpu: '100m',
                    memory: '128Mi'
                  },
                  limits: {
                    cpu: '500m',
                    memory: '256Mi'
                  }
                }
              }
            ]
          }
        }
      }
    });

    new KubeService(this, 'users-api-svc', {
      spec: {
        type: 'ClusterIP',
        selector: { app: 'users-api' },
        ports: [
          {
            port: 80,
            targetPort: 3000
          }
        ]
      }
    });
  }
}
