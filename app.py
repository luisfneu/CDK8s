#!/usr/bin/env python3
from constructs import Construct
from cdk8s import App
from main import NginxChart

app = App()
NginxChart(app, "nginx-chart")
app.synth()
