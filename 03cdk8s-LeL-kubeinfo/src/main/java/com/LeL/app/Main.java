package com.mycompany.app;

import software.constructs.Construct;

import org.cdk8s.App;
import org.cdk8s.Chart;
import org.cdk8s.ChartProps;

import imports.k8s.*;

import java.util.Collections;
import java.util.Map;

public class Main extends Chart
{

    public Main(final Construct scope, final String id) {
        this(scope, id, null);
    }

    public Main(final Construct scope, final String id, final ChartProps options) {
        super(scope, id, ChartProps.builder()
                .namespace("cdk8s")
                .build());

        final Map<String, String> label = Collections.singletonMap("app", "podinfo-k8s");

        new KubeService(this, "service", KubeServiceProps.builder()
                .spec(ServiceSpec.builder()
                        .type("LoadBalancer")
                        .ports(Collections.singletonList(
                                ServicePort.builder()
                                        .port(81)
                                        .targetPort(IntOrString.fromNumber(9898))
                                        .build()))
                        .selector(label)
                        .build())
                .build());

        new KubeDeployment(this, "deployment", KubeDeploymentProps.builder()
                .spec(DeploymentSpec.builder()
                        .replicas(1)
                        .selector(LabelSelector.builder()
                                .matchLabels(label)
                                .build())
                        .template(PodTemplateSpec.builder()
                                .metadata(ObjectMeta.builder()
                                        .labels(label)
                                        .build())
                                .spec(PodSpec.builder()
                                        .containers(Collections.singletonList(
                                                Container.builder()
                                                        .name("podinfo-kubernetes")
                                                        .image("stefanprodan/podinfo:6.11.1")
                                                        .ports(Collections.singletonList(
                                                                ContainerPort.builder()
                                                                        .containerPort(9898)
                                                                        .build()))
                                                        .build()))
                                        .build())
                                .build())
                        .build())
                .build());
    }

    public static void main(String[] args) {
        final App app = new App();
        new Main(app, "core");
        app.synth();
    }
}