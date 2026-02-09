export interface EnvironmentConfig {
  namespace: string;
  replicas: number;
  resources: {
    cpu: {
      request: string;
      limit: string;
    };
    memory: {
      request: string;
      limit: string;
    };
  };
  autoscaling: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
  };
  env: Record<string, string>;
}

export const environments = {
  development: {
    namespace: 'development',
    replicas: 1,
    resources: {
      cpu: {
        request: '100',
        limit: '200',
      },
      memory: {
        request: '128',
        limit: '256',
      },
    },
    autoscaling: {
      minReplicas: 1,
      maxReplicas: 3,
      targetCPU: 80,
    },
    env: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
    },
  } as EnvironmentConfig,

  staging: {
    namespace: 'staging',
    replicas: 2,
    resources: {
      cpu: {
        request: '200',
        limit: '500',
      },
      memory: {
        request: '256',
        limit: '512',
      },
    },
    autoscaling: {
      minReplicas: 2,
      maxReplicas: 5,
      targetCPU: 75,
    },
    env: {
      NODE_ENV: 'staging',
      LOG_LEVEL: 'info',
    },
  } as EnvironmentConfig,

  production: {
    namespace: 'production',
    replicas: 3,
    resources: {
      cpu: {
        request: '500',
        limit: '1000',
      },
      memory: {
        request: '512',
        limit: '1024',
      },
    },
    autoscaling: {
      minReplicas: 3,
      maxReplicas: 10,
      targetCPU: 70,
    },
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn',
    },
  } as EnvironmentConfig,
};

/**
 * @param env
 * @returns
 */
export function getEnvironmentConfig(
  env: keyof typeof environments = 'development'
): EnvironmentConfig {
  return environments[env];
}
