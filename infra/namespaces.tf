resource "kubernetes_namespace" "apps" {
  metadata {
    name = var.apps_namespace
  }
}
