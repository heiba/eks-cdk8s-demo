import {Chart, Include} from 'cdk8s';
import {Construct} from 'constructs';

export class KubernetesDashboardChart extends Chart
{
	constructor(scope: Construct, id: string)
	{
		super(scope, id);

		// Reference
		// https://github.com/kubernetes/dashboard/releases/
		// https://cdk8s.io/docs/latest/concepts/include/

		new Include(this, 'kubernetes-dashboard-chart', {
			url: 'https://raw.githubusercontent.com/kubernetes/dashboard/v2.4.0/aio/deploy/recommended.yaml',
		});
	}
}
