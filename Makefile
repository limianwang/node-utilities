
TESTS = $(shell find tests -name 'test_*.js')

.PHONY: install
install:
	@npm install

.PHONY: clean
clean:
	@rm -f npm-debug.log && rm -rf node_modules && rm -rf coverage

.PHONY: test
test:
	@./node_modules/mocha/bin/mocha -R spec -u bdd $(TESTS)

.PHONY: test-cov
test-cov:
	@node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha $(TESTS)

