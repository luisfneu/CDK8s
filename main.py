from constructs import Construct
from cdk8s import Chart
from imports import k8s

class NginxChart(Chart):
    def __init__(self, scope: Construct, id: str):
        super().__init__(scope, id)

        labels = {"app": "nginx"}

        k8s.KubeDeployment(self, 'nginx-deployment',
            spec=k8s.DeploymentSpec(
                replicas=2,
                selector=k8s.LabelSelector(match_labels=labels),
                template=k8s.PodTemplateSpec(
                    metadata=k8s.ObjectMeta(labels=labels),
                    spec=k8s.PodSpec(containers=[
                        k8s.Container(
                            name="nginx",
                            image="nginx:latest",
                            ports=[k8s.ContainerPort(container_port=80)]
                        )
                    ])
                )
            )
        )

        k8s.KubeService(self, 'nginx-service',
            spec=k8s.ServiceSpec(
                type="NodePort",
                selector=labels,
                ports=[
                    k8s.ServicePort(
                        port=80,
                        target_port=k8s.IntOrString.from_number(80)
                    )
                ]
            )
        )
