.PHONY: dev wipe prod

dev: local.db files
	npm run dev

files:
	mkdir -p files

local.db: node_modules
	npx drizzle-kit push

node_modules:
	npm install

wipe:
	rm -rf files local.db
