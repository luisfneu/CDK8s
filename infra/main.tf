data "external" "minikube_ip" {
	count = var.enable_ingress && var.minikube_ip_override == "" ? 1 : 0
	# Emit JSON: {"ip":"<address>"}; fallback to 127.0.0.1 if minikube not available (pre-cluster)
	program = [
		"bash",
		"-c",
		"ip=$(minikube ip 2>/dev/null || echo 127.0.0.1); echo '{\"ip\":\"'$ip'\"}'"
	]
}


resource "null_resource" "start_port_forwards" {
	triggers = {
		script_sha = filesha256("${path.root}/../scripts/port-forward.sh")
		jenkins_id = try(helm_release.jenkins.id, "")
		prom_id    = try(helm_release.kube_prometheus_stack.id, "")
		force_bump = var.force_port_forward_refresh
		always_run = uuid()
	}

	provisioner "local-exec" {
		command = "bash ${path.root}/../scripts/port-forward.sh"
		interpreter = ["/bin/bash", "-c"]
	}

	depends_on = [helm_release.jenkins, helm_release.kube_prometheus_stack]
}

