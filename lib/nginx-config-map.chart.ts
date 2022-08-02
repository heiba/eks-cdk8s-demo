import {ConfigMap} from 'cdk8s-plus-21'
import {Construct} from 'constructs';
import * as fs from 'fs';
import {Chart} from 'cdk8s';

export class NginxConfigMapChart extends Chart
{
	constructor(scope: Construct, id: string)
	{
		super(scope, id);

		new ConfigMap(this, 'nginx-config-map-chart', {
			metadata: {
				name: 'nginx-config',
				namespace: 'ingress-nginx'
			},
			data: {
				"nginx.conf": fs.readFileSync(`${__dirname}/nginx/nginx.conf`, 'utf-8')
			}
		})
	}
}
