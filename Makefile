## help:		    	List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

## bower-install:		Bower install
bower-install:
	./node_modules/.bin/bower install

## npm-install: 		Npm install
npm-install:
	npm install

## copy-config-files:	Copy config file
copy-config-files:
	cp ./app/config/application.json.dist ./app/config/application.json;

## install      		Install local project
install: npm-install bower-install copy-config-files

## clear-project		Clear project
clear-project:
	rm -rf node_modules; \
	rm -rf app/bower_components; \
	rm -f ./app/config/application.json;

