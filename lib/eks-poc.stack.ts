import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Cluster, ClusterLoggingTypes, DefaultCapacityType, KubernetesVersion} from 'aws-cdk-lib/aws-eks';
import {InstanceClass, InstanceSize, InstanceType} from 'aws-cdk-lib/aws-ec2';
import {AccountRootPrincipal, Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {KubernetesDashboardChart} from './kubernetes-dashboard.chart';
import {App} from 'cdk8s';
import {eksAdminClusterRoleBindingManifest} from './eks-admin.manifest';
import {NginxIngressControllerChart} from './nginx-ingress-controller.chart';
import {NginxConfigMapChart} from './nginx-config-map.chart';

export class EksPocStack extends Stack
{
	constructor(scope: Construct, id: string, props?: StackProps)
	{
		super(scope, id, props);

		const EksFullAccessPolicy = new PolicyDocument({
			statements: [
				new PolicyStatement({
					resources: ['*'],
					actions: ['eks:*'],
					effect: Effect.ALLOW
				})
			]
		});

		const eksMastersRole = new Role(this, 'eks-poc-cluster-masters-role', {
			roleName: 'eks-poc-cluster-master-role',
			assumedBy: new AccountRootPrincipal(),
			description: 'EKS POC Cluster Master Role',
			inlinePolicies: {EksFullAccessPolicy: EksFullAccessPolicy},
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('IAMReadOnlyAccess'),
			]
		});

		const eksClusterRole = new Role(this, 'eks-poc-cluster-role', {
			roleName: 'eks-poc-cluster-role',
			assumedBy: new ServicePrincipal('eks.amazonaws.com'),
			description: "EKS POC Cluster Role to manage other AWS services",
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSClusterPolicy'),
				ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'),
				ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSServicePolicy'),
				ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'),
				ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSVPCResourceController')
			]
		})

		const eksCluster = new Cluster(this, 'eks-poc-cluster', {
			version: KubernetesVersion.V1_21,
			clusterName: 'eks-poc-cluster',
			defaultCapacityType: DefaultCapacityType.NODEGROUP,
			defaultCapacity: 10,
			clusterLogging: [
				ClusterLoggingTypes.API,
				ClusterLoggingTypes.CONTROLLER_MANAGER,
				ClusterLoggingTypes.AUDIT,
				ClusterLoggingTypes.AUTHENTICATOR,
				ClusterLoggingTypes.SCHEDULER],
			outputMastersRoleArn: false,
			outputConfigCommand: true,
			outputClusterName: true,
			defaultCapacityInstance: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
			mastersRole: eksMastersRole,
			role: eksClusterRole
		});

		eksCluster.addServiceAccount('eks-admin-service-account', {
			name: 'eks-admin',
			namespace: 'kube-system',
		});

		const eksAdminClusterRoleBindingKubernetesManifest = eksCluster.addManifest('eks-admin-cluster-role-binding', eksAdminClusterRoleBindingManifest);

		const kubernetesDashboardChart = new KubernetesDashboardChart(new App(), 'kubernetes-dashboard-chart');
		eksCluster.addCdk8sChart('eks-kubernetes-dashboard-chart', kubernetesDashboardChart);
		kubernetesDashboardChart.addDependency(eksAdminClusterRoleBindingKubernetesManifest);

		const nginxConfigMapChart = new NginxConfigMapChart(new App(), 'nginx-config-map-chart');
		eksCluster.addCdk8sChart('eks-nginx-config-map-chart', nginxConfigMapChart);

		const nginxIngressControllerChart = new NginxIngressControllerChart(new App(), 'nginx-ingress-controller-chart');
		eksCluster.addCdk8sChart('eks-nginx-ingress-controller-chart', nginxIngressControllerChart);
	}
}
