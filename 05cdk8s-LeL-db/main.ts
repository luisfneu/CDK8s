import { App, Chart, ChartProps, Size, Duration } from 'cdk8s';
import { Construct } from 'constructs';
import * as kplus from 'cdk8s-plus-28';

export interface DatabaseChartProps extends ChartProps {
  dbName: string;
  namespace?: string;
  image: string;
  port: number;
  storageSize?: string;
  rootPassword: string;
}

export class DatabaseChart extends Chart {
  constructor(scope: Construct, id: string, props: DatabaseChartProps) {
    super(scope, id, {
      ...props,
      namespace: props.namespace || 'cdk8s',
    });

    const {
      dbName,
      image,
      port,
      storageSize = '10Gi',
      rootPassword,
    } = props;

    const labels = {
      app: dbName,
      tier: 'database',
      managedBy: 'cdk8s',
    };

    const secret = new kplus.Secret(this, 'secret', {
      metadata: {
        name: `${dbName}-secret`,
        labels,
      },
      stringData: {
        'root': rootPassword,
      },
    });

    const pvc = new kplus.PersistentVolumeClaim(this, 'pvc', {
      metadata: {
        name: `${dbName}-pvc`,
        labels,
      },
      accessModes: [kplus.PersistentVolumeAccessMode.READ_WRITE_ONCE],
      storage: Size.gibibytes(parseInt(storageSize)),
    });

    const statefulSet = new kplus.StatefulSet(this, 'statefulset', {
      metadata: {
        name: dbName,
        labels,
      },
      replicas: 1,
      service: new kplus.Service(this, 'service', {
        metadata: {
          name: `${dbName}-service`,
          labels,
        },
        ports: [{
          port,
          targetPort: port,
        }],
      }),
      podMetadata: {
        labels,
      },
    });

    const container = statefulSet.addContainer({
      name: dbName,
      image,
      port,
      securityContext: {
        ensureNonRoot: false,
        readOnlyRootFilesystem: false,
      },
      resources: {
        cpu: {
          request: kplus.Cpu.millis(250),
          limit: kplus.Cpu.millis(500),
        },
        memory: {
          request: Size.mebibytes(512),
          limit: Size.gibibytes(1),
        },
      },
      liveness: kplus.Probe.fromCommand([
        'mysqladmin',
        'ping',
        '-h',
        'localhost',
      ], {
        initialDelaySeconds: Duration.seconds(30),
        periodSeconds: Duration.seconds(10),
        timeoutSeconds: Duration.seconds(5),
      }),
      readiness: kplus.Probe.fromCommand([
        'mysqladmin',
        'ping',
        '-h',
        'localhost',
      ], {
        initialDelaySeconds: Duration.seconds(10),
        periodSeconds: Duration.seconds(5),
      }),
    });

    container.env.addVariable(
      'MYSQL_ROOT_PASSWORD',
      kplus.EnvValue.fromSecretValue({
        secret,
        key: 'root',
      })
    );

    const volume = kplus.Volume.fromPersistentVolumeClaim(
      this,
      'data-volume',
      pvc
    );
    container.mount('/var/lib/mysql', volume);
  }
}

const app = new App();
new DatabaseChart(app, 'database', {
  dbName: 'mysql',
  image: 'mysql:8.0',
  port: 3306,
  rootPassword: 'changeme',
});
app.synth();
