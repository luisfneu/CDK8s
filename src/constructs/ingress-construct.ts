import { Construct } from 'constructs';
import * as kplus from 'cdk8s-plus-27';

export interface IngressConstructProps {
  name: string;
  host: string;
  service: kplus.Service;
  port: number;
  path?: string;
  tls?: boolean;
  tlsSecret?: string;
  annotations?: Record<string, string>;
}export class IngressConstruct extends Construct {
  public readonly ingress: kplus.Ingress;

  constructor(scope: Construct, id: string, props: IngressConstructProps) {
    super(scope, id);

    const {
      name,
      host,
      service,
      port,
      path = '/',
      tls = false,
      tlsSecret,
      annotations = {},
    } = props;

    const defaultAnnotations = {
      'kubernetes.io/ingress.class': 'nginx',
      'nginx.ingress.kubernetes.io/ssl-redirect': tls ? 'true' : 'false',
      ...annotations,
    };

    this.ingress = new kplus.Ingress(this, 'ingress', {
      metadata: {
        name,
        annotations: defaultAnnotations,
      },
    });

    this.ingress.addRule(host, path, kplus.IngressBackend.fromService(service, {
      port,
    }));

    if (tls && tlsSecret) {
      this.ingress.addTls([{
        hosts: [host],
        secret: kplus.Secret.fromSecretName(this, 'tls-secret', tlsSecret),
      }]);
    }
  }
}
