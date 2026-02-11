import { Chart, ChartProps } from 'cdk8s';
import { Construct } from 'constructs';
import * as kplus from 'cdk8s-plus-27';

export interface DatabaseChartProps extends ChartProps {
  dbName: string;
  namespace?: string;
  image: string;
  port: number;
  storageSize?: string;
  rootPassword: string;

export class DatabaseChart extends Chart {
  constructor(scope: Construct, id: string, props: DatabaseChartProps) {
    super(scope, id, {
      ...props,
      namespace: props.namespace || 'default',
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
      storage: kplus.Size.gibibytes(parseInt(storageSize)),
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
    });

    container.env.addVariable(
      'MYSQL_ROOT_PASSWORD',
      kplus.EnvValue.fromSecretValue({
        secret,
        key: 'root',
      })
    );

    container.resources.cpu.request(kplus.Cpu.millis(250));
    container.resources.cpu.limit(kplus.Cpu.millis(500));
    container.resources.memory.request(kplus.Size.mebibytes(512));
    container.resources.memory.limit(kplus.Size.gibibytes(1));

    const volume = kplus.Volume.fromPersistentVolumeClaim(
      this,
      'data-volume',
      pvc
    );
    container.mount('/var/lib/mysql', volume);

    container.addLivenessProbe(kplus.Probe.fromCommand([
      'mysqladmin',
      'ping',
      '-h',
      'localhost',
    ], {
      initialDelaySeconds: kplus.Duration.seconds(30),
      periodSeconds: kplus.Duration.seconds(10),
      timeoutSeconds: kplus.Duration.seconds(5),
    }));

    container.addReadinessProbe(kplus.Probe.fromCommand([
      'mysqladmin',
      'ping',
      '-h',
      'localhost',
    ], {
      initialDelaySeconds: kplus.Duration.seconds(10),
      periodSeconds: kplus.Duration.seconds(5),
    }));
  }
}
