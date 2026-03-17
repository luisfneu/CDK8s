import { App, Chart } from 'cdk8s';
import { KubeDeployment, KubeIngress, KubeService, IntOrString } from './imports/k8s';

const app = new App();
const chart = new Chart(app, 'cdk8s-LeL', {
    disableResourceNameHashes: true,
    namespace: 'cdk8s'
});

const labels = { app: 'nginx' }

new KubeDeployment (chart, 'deployment', { 
    spec: {
      selector:  { 
        matchLabels: {app: 'nginx'}
      },
      template:  { 
        metadata: { 
          labels: labels
        }, 
        spec: { 
          containers: [
            {
            name: 'nginx',
            image: 'nginx',
            ports: [{containerPort: 80}]
          }
        ]
      }
    }
  }
}) 

const svc = new KubeService(chart, 'svc', {
  spec: {
    type: 'NodePort',
    ports: [{port: 80, targetPort: IntOrString.fromNumber(80)}],
    selector: labels
  }
})

new KubeIngress(chart, 'ingress', {
  spec: {
    rules: [
      {
        http: {
        paths: [
          {
            path: '/',
            pathType: 'Prefix',
            backend: {
              service: {
                name: svc.name,
                port: {number: 80}
              }
            }
          }
        ]
        }
      }
    ]
  }
})

app.synth();

// we have 1 app and this app have charts inside
// we going to develop our infra, is very fun to creat it here