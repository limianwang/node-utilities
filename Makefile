
TESTS = $(shell find tests -name 'test_*.js')

install:
	npm install

clean:
	rm -f npm-debug.log
	rm -rf node_modules
	rm -rf coverage

test:
	./node_modules/mocha/bin/mocha -R spec -u bdd $(TESTS)

test-cov:
	node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha $(TESTS)

.PHONY: test
