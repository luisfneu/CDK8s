output "infra_namespace" {
  value = kubernetes_namespace.infra.metadata[0].name
}

output "apps_namespace" {
  value = kubernetes_namespace.apps.metadata[0].name
}