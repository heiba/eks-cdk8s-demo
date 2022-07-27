export const eksAdminClusterRoleBindingManifest =
	{
		apiVersion: 'rbac.authorization.k8s.io/v1',
		kind: 'ClusterRoleBinding',
		metadata:
			{
				name: 'eks-admin'
			},
		roleRef:
			{
				apiGroup: 'rbac.authorization.k8s.io',
				kind: 'ClusterRole',
				name: 'cluster-admin'
			},
		subjects:
			[{
				kind: 'ServiceAccount',
				name: 'eks-admin',
				namespace: 'kube-system'
			}]
	}
