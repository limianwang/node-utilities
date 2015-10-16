
2.1.0 / 2015-10-16
==================

  * docs: update documentation for clean method
  * code: add support for clean method

2.0.1 / 2015-10-01
==================

  * code: use return to avoid else
  * build: test against all node versions
  * build: suppress output from makefile
  * deps: update mocha
  * addons for .travis
  * setting the env for compiler
  * test against node.js 4.x

2.0.0 / 2015-07-30
==================

  * deps: chai@3.2.0 bcrypt@0.8.4 bluebird@2.9.34
  * code: deprecate unnecessary memoize func
  * code: always pad string length + 1
  * build: use new travis infrastructure
  * code: added padder (for prefixing)
  * deps: bump chai
  * deps: update dependencies
  * docs: added badge for downloads

1.7.5 / 2015-04-01
==================

  * code: fix improper merge case

1.7.4 / 2015-03-28
==================

  * deps: update deps to latest
  * docs: clean up documentations
  * docs: in year 2015

1.7.3 / 2015-03-18
==================

  * docs. update the url to correct npm
  * added .npmignore
  * docs: update name to node-helper-utilities
  * docs: added deps badge
  * build: update to the makefile
  * deps: chai@2.1.1 istanbul@0.3.7 sinon@1.13.0 bluebird@2.9.13


1.7.2 / 2015-02-20
==================

  * code: refactor `clone` to support Date
  * build: chai@2.0.0 && bluebird@2.9.9 && native-or-bluebird@1.2.0
  * docs: formatting readme
  * docs: update test versions
  * build: test 0.12
  * docs: added information regarding travis build
  * build: add iojs

1.7.1 / 2015-02-02
==================

  * docs: added History.md
  * deps: bluebird@2.9.5

1.7.0 / 2015-01-30
==================

  * test: test against string-path
  * docs: update documentation for read/write files
  * test: update test to create a file to read before test
  * code: promisify writeFile

1.6.0 / 2015-01-28
==================

  * code: clean up promise code
  * docs: update documentation
  * code: added read file
  * build: bcrypt@0.8.1 mocha@2.1.0 native-or-bluebird@1.1.2
  * code: use native-or-bluebird
  * docs: added tag badge.
  * code: added safe json parsing
  * docs: simplified way of installing
  * test: clean up the tests

1.5.0 / 2015-01-20
==================

  * docs: remove reference to node callback style
  * test: update tests to only test against promise style
  * code: use strictly promises
  * make: use Makefile for build process
  * Update README.md
  * defer functions to later time

1.4.0 / 2015-01-09
==================

  * Update README.md
  * Use coveralls
  * bcrypt hash and code coverage
  * Increase code coverage, and update to use Promises
  * added check to ensure merging objects to objects

1.3.1 / 2014-12-29
==================

  * added edgecase tests for merge and clone
  * added support to merge arrays
  * Update README.md
  * update test description
  * test to ensure default instance is set

1.3.0 / 2014-12-28
==================
  * added enable toggle for disabling cluster

1.2.0 / 2014-12-28
==================
  * added cluster configurations support and bump version
  * fix the variable name
  * token generator async

1.1.1 / 2014-12-16
==================
  * added cluster helper.
  * remove unused code
  * Fix Repository name

1.0.0 / 2014-12-08
==================
  * Update README.md with memoize instructions
  * added memoize method to cache function responses.
  * added merge function and corresponding tests.
  * add travis build status
  * remove tests against old versions.
  * added .travis for CI
  * added istanbul for code coverage and added tests to increase coverage
  * update documentations
  * Added description to the usage.
  * added generic clone functions
  * Initial commit
