develop:
	npm run dev

install:
	npm ci

lint:
	npx eslint .

build:
	NODE_ENV=production npm run build

test:
	echo no tests