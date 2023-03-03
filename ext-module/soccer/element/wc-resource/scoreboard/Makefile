## help:			List command
help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


## zip:			Generate zip wc
zip:
	rm wc-resource-soccer-scoreboard.zip; \
	zip -r wc-resource-soccer-scoreboard.zip wc-resource-soccer-scoreboard.js package.json node_modules