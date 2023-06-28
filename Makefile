.ONESHELL:

include .env.local
include .env

DOCKER_COMPOSE := docker-compose -f deployments/$(ENVIRONMENT)/docker-compose.yml --env-file .env.local

# ==================================================
# .TARGET: general
# ==================================================
.PHONY: init

init: # initialize project
	$(MAKE) up
	$(DOCKER_COMPOSE) exec -T $(SERVICE) yarn
	$(MAKE) login
	$(MAKE) create

# ==================================================
# .TARGET: clasp
# ==================================================
.PHONY: login create pull push watch deployments deploy

login: # log in to script.google.com
	$(DOCKER_COMPOSE) exec -T $(SERVICE) yarn run login &
	pid=$$(echo $$!)
	echo -------------------------BEGIN-------------------------
	sleep 5
	echo -------------------------END-------------------------
	cat <<- EOL
	1. Open the displayed URL in your browser
	2. Paste the URL of your browser after allowing [clasp – The Apps Script CLI]
	EOL
	url=$$(.prompt 'URL' 'after logging in with your browser')
	if ! $(DOCKER_COMPOSE) exec $(SERVICE) curl -fsSL "$$url"; then
		.failure 'request failed. terminate authentication.'
		kill -KILL $$pid
		exit 1
	fi
	.success 'request succeeded. waiting for completion.'
	wait $$pid
	$(DOCKER_COMPOSE) exec $(SERVICE) sh -c "mv ~/.clasprc.json ."
create: # create a script
	$(DOCKER_COMPOSE) exec $(SERVICE) sh -c "yarn run create && mv ./src/.clasp.json ."
pull: # fetch a remote project
	$(DOCKER_COMPOSE) exec $(SERVICE) yarn run pull
push: # update the remote project
	$(DOCKER_COMPOSE) exec $(SERVICE) yarn run push
watch: # update the remote project whenever files change
	$(DOCKER_COMPOSE) exec $(SERVICE) yarn run watch
deployments: # list deployment ids of a script
	$(DOCKER_COMPOSE) exec $(SERVICE) yarn run deployments
deploy: # deploy a project
	$(DOCKER_COMPOSE) exec $(SERVICE) yarn run deploy

# ==================================================
# .TARGET: node
# ==================================================
.PHONY: src/%.ts ts-node/%

src/%.ts: # compile and execute
	$(MAKE) ts-node/$@
ts-node/%:
	$(DOCKER_COMPOSE) exec $(SERVICE) sh -c 'dotenv -e .env.local -- ts-node -r tsconfig-paths/register --files $*'

# ==================================================
# .TARGET: docker
# ==================================================
.PHONY: build build/% run run/% up up/% exec exec/% down down/% logs log log/%

build: build/$(SERVICE)
build/%: # build or rebuild a image
	$(DOCKER_COMPOSE) build $*

run: run/$(SERVICE)
run/%: # run a one-off command on a container
	$(DOCKER_COMPOSE) run --rm $* sh -c 'bash || sh'

exec: exec/$(SERVICE)
exec/%: # run a command in a running container
	$(DOCKER_COMPOSE) exec $* sh -c 'bash || sh'

up: # create and start containers, networks, and volumes
	$(DOCKER_COMPOSE) up -d
up/%: # create and start a container
	$(DOCKER_COMPOSE) up -d $*

down: # stop and remove containers, networks, images, and volumes
	$(DOCKER_COMPOSE) down
down/%: # stop and remove a container
	$(DOCKER_COMPOSE) rm -fsv $*

logs: # view output from containers
	$(DOCKER_COMPOSE) logs -f

log: log/$(SERVICE)
log/%: # view output from a container
	$(DOCKER_COMPOSE) logs -f $*

# ==================================================
# .TARGET: other
# ==================================================
.PHONY: help clean

help: # list available targets and some
	@len=$$(awk -F':' 'BEGIN {m = 0;} /^[^\s]+:/ {gsub(/%/, "<service>", $$1); l = length($$1); if(l > m) m = l;} END {print m;}' $(MAKEFILE_LIST)) && \
	printf \
		"%s%s\n\n%s\n%s\n\n%s\n%s\n" \
		"usage:" \
		"$$(printf " make <\033[1mtarget\033[0m>")" \
		"services:" \
		"$$($(DOCKER_COMPOSE) config --services | awk '{ $$1 == "$(SERVICE)" ? x = "* " : x = ""; } { printf("  \033[1m%s%s\033[0m\n", x, $$1); }')" \
		"targets:" \
		"$$(awk -F':' '/^\S+:/ {gsub(/%/, "<service>", $$1); gsub(/^[^#]+/, "", $$2); gsub(/^[# ]+/, "", $$2); if ($$2) printf "  \033[1m%-'$$len's\033[0m  %s\n", $$1, $$2;}' $(MAKEFILE_LIST))"

clean: # remove cache files from the working directory
