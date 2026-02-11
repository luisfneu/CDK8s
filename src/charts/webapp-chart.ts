import { Chart, ChartProps } from 'cdk8s';
import { Construct } from 'constructs';
import * as kplus from 'cdk8s-plus-27';

export interface WebAppChartProps extends ChartProps {
  appName: string;
  namespace?: string;
  replicas?: number;
  image: string;
  port: number;
  env?: Record<string, string>;
  resources?: {
    cpu?: {
      request?: string;
      limit?: string;
    };
    memory?: {
      request?: string;
      limit?: string;
    };
  };
}

export class WebAppChart extends Chart {
  constructor(scope: Construct, id: string, props: WebAppChartProps) {
    super(scope, id, {
      ...props,
      namespace: props.namespace || 'default',
    });

    const {
      appName,
      replicas = 2,
      image,
      port,
      env = {},
      resources,
    } = props;

    const labels = {
      app: appName,
      managedBy: 'cdk8s',
    };

    const configMap = new kplus.ConfigMap(this, 'config', {
      metadata: {
        name: `${appName}-config`,
        labels,
      },
      data: {
        'app.name': appName,
        'app.environment': 'production',
        ...env,
      },
    });

    const deployment = new kplus.Deployment(this, 'deployment', {
      metadata: {
        name: appName,
        labels,
      },
      replicas,
      select: false,
      podMetadata: {
        labels,
      },
    });

    const container = deployment.addContainer({
      name: appName,
      image,
      port,
      securityContext: {
        readOnlyRootFilesystem: false,
        ensureNonRoot: false,
      },
    });

    Object.keys(configMap.data).forEach((key) => {
      container.env.addVariable(key, kplus.EnvValue.fromConfigMap(configMap, key));
    });

    if (resources) {
      if (resources.cpu?.request) {
        container.resources.cpu.request(kplus.Cpu.millis(
          parseInt(resources.cpu.request)
        ));
      }
      if (resources.cpu?.limit) {
        container.resources.cpu.limit(kplus.Cpu.millis(
          parseInt(resources.cpu.limit)
        ));
      }
      if (resources.memory?.request) {
        container.resources.memory.request(kplus.Size.mebibytes(
          parseInt(resources.memory.request)
        ));
      }
      if (resources.memory?.limit) {
        container.resources.memory.limit(kplus.Size.mebibytes(
          parseInt(resources.memory.limit)
        ));
      }
    }

    container.addLivenessProbe(kplus.Probe.fromHttpGet('/', {
      port: port,
      initialDelaySeconds: kplus.Duration.seconds(10),
      periodSeconds: kplus.Duration.seconds(10),
    }));

    container.addReadinessProbe(kplus.Probe.fromHttpGet('/', {
      port: port,
      initialDelaySeconds: kplus.Duration.seconds(5),
      periodSeconds: kplus.Duration.seconds(5),
    }));

    const service = new kplus.Service(this, 'service', {
      metadata: {
        name: `${appName}-service`,
        labels,
      },
      selector: deployment,
      ports: [
        {
          port,
          targetPort: port,
        },
      ],
    });

    deployment.autoScale({
      maxReplicas: 10,
      minReplicas: replicas,
      target: {
        cpuUtilization: 70,
      },
    });
  }
}
