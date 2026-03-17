import { DatabaseChart } from './main';
import { Testing } from 'cdk8s';

describe('DatabaseChart', () => {
  test('Snapshot', () => {
    const app = Testing.app();
    const chart = new DatabaseChart(app, 'test-chart', {
      dbName: 'mysql',
      image: 'mysql:8.0',
      port: 3306,
      rootPassword: 'changeme',
    });
    const results = Testing.synth(chart);
    expect(results).toMatchSnapshot();
  });
});
