import {Chart, Include} from 'cdk8s';
import {Construct} from 'constructs';

export class NginxIngressControllerChart extends Chart
{
	constructor(scope: Construct, id: string)
	{
		super(scope, id);

		// Reference
		// https://cdk8s.io/docs/latest/concepts/include/
		// https://kubernetes.github.io/ingress-nginx/deploy/

		new Include(this, 'nginx-ingress-controller', {
			url: 'https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.0/deploy/static/provider/aws/deploy.yaml'
		});
	}
}
