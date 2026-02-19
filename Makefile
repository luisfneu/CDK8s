.PHONY: help install import build synth deploy clean dev watch

install:
	npm install

import:
	npm run import

build:
	npm run build

synth:
	npm run synth

dev: build synth

deploy: dev
	kubectl apply -f dist/

clean:
	rm -rf dist/ node_modules/ imports/
	find . -name "*.js" -type f -delete
	find . -name "*.d.ts" -type f -delete

watch:
	npm run watch
